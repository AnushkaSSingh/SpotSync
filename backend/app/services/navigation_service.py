import heapq
import logging
import math

from app.core.config import settings
from app.database.neo4j import get_neo4j_driver


logger = logging.getLogger(__name__)

ENTRANCE_KEY = "ENTRANCE_MAIN"


class NavigationDatabaseUnavailable(Exception):
    pass


def _get_driver():
    driver = get_neo4j_driver()
    if driver is None:
        raise NavigationDatabaseUnavailable("Neo4j is not connected")
    return driver


def validate_slot_exists(slot_id: int) -> dict:
    """Return an operational parking-space node by PostgreSQL ID."""
    driver = _get_driver()
    with driver.session(database=settings.neo4j_database) as session:
        record = session.run(
            """
            MATCH (p:ParkingSpace {pg_id: $slot_id})
            RETURN p
            """,
            slot_id=slot_id,
        ).single()

    if record is None:
        raise ValueError(f"Parking slot {slot_id} does not exist in the graph")

    props = dict(record["p"])
    if props.get("official_operational_space") is not True:
        raise ValueError(f"Parking slot {slot_id} is not operational")

    return props


def get_floor_for_slot(slot_id: int):
    validate_slot_exists(slot_id)
    driver = _get_driver()

    with driver.session(database=settings.neo4j_database) as session:
        record = session.run(
            """
            MATCH (f:Floor)-[:HAS_SPACE]->(p:ParkingSpace {pg_id: $slot_id})
            RETURN f
            LIMIT 1
            """,
            slot_id=slot_id,
        ).single()

    return dict(record["f"]) if record else None


def _calculate_weighted_route(slot_id: int):
    """Dijkstra over directed PATH relationships with real distance_m weights."""
    validate_slot_exists(slot_id)
    driver = _get_driver()

    with driver.session(database=settings.neo4j_database) as session:
        start_record = session.run(
            """
            MATCH (e:Entrance {key: $entrance_key})
            RETURN e
            LIMIT 1
            """,
            entrance_key=ENTRANCE_KEY,
        ).single()

        target_record = session.run(
            """
            MATCH (p:ParkingSpace {pg_id: $slot_id})
            RETURN p
            LIMIT 1
            """,
            slot_id=slot_id,
        ).single()

        if start_record is None or target_record is None:
            return None

        start_node = start_record["e"]
        target_node = target_record["p"]

        edge_records = list(session.run(
            """
            MATCH (a)-[r:PATH]->(b)
            RETURN a, r, b
            """
        ))

    start_id = start_node.element_id
    target_id = target_node.element_id

    graph = {}
    node_data = {
        start_id: {"labels": list(start_node.labels), "properties": dict(start_node)},
        target_id: {"labels": list(target_node.labels), "properties": dict(target_node)},
    }

    for record in edge_records:
        source = record["a"]
        relationship = record["r"]
        destination = record["b"]

        props = dict(relationship)
        distance = props.get("distance_m")

        if isinstance(distance, bool) or not isinstance(distance, (int, float)):
            continue
        if not math.isfinite(float(distance)) or distance <= 0:
            continue

        travel_time = props.get("travel_time_s")
        if isinstance(travel_time, bool) or not isinstance(travel_time, (int, float)):
            travel_time = None

        source_id = source.element_id
        destination_id = destination.element_id

        node_data[source_id] = {
            "labels": list(source.labels),
            "properties": dict(source),
        }
        node_data[destination_id] = {
            "labels": list(destination.labels),
            "properties": dict(destination),
        }

        graph.setdefault(source_id, []).append({
            "to": destination_id,
            "distance_m": float(distance),
            "travel_time_s": float(travel_time) if travel_time is not None else None,
            "accessible": props.get("accessible"),
        })

    # Directed edges are respected; no imaginary reverse path is added.
    distances = {start_id: 0.0}
    previous = {}
    queue = [(0.0, start_id)]

    while queue:
        current_distance, current_id = heapq.heappop(queue)

        if current_distance != distances.get(current_id):
            continue
        if current_id == target_id:
            break

        for edge in graph.get(current_id, []):
            next_id = edge["to"]
            candidate = current_distance + edge["distance_m"]

            if candidate < distances.get(next_id, float("inf")):
                distances[next_id] = candidate
                previous[next_id] = (current_id, edge)
                heapq.heappush(queue, (candidate, next_id))

    if target_id not in distances:
        return None

    route_ids = [target_id]
    route_edges = []
    cursor = target_id

    while cursor != start_id:
        previous_item = previous.get(cursor)
        if previous_item is None:
            return None
        parent_id, edge = previous_item
        route_edges.append(edge)
        route_ids.append(parent_id)
        cursor = parent_id

    route_ids.reverse()
    route_edges.reverse()

    route_nodes = []
    for node_id in route_ids:
        item = node_data[node_id]
        route_nodes.append({
            "labels": item["labels"],
            "properties": item["properties"],
        })

    total_time = (
        sum(edge["travel_time_s"] for edge in route_edges)
        if all(edge["travel_time_s"] is not None for edge in route_edges)
        else None
    )

    return {
        "slot_id": slot_id,
        "route": route_nodes,
        "distance_m": distances[target_id],
        "travel_time_s": total_time,
        "requires_ramp": any(
            "Ramp" in node["labels"] for node in route_nodes
        ),
        "accessible": all(
            edge["accessible"] is True for edge in route_edges
        ),
        "route_source": "Neo4j PATH relationships",
        "route_data_status": "SIMULATED_DEMO",
        "topology_status": "UNVERIFIED_PLACEHOLDER",
        "accessibility_status": "SIMULATED_UNVERIFIED",
        "disclaimer": (
            "Distances, travel times, and accessibility values are simulated "
            "and must not be treated as verified real-world measurements."
        ),
    }


def get_route_to_slot(slot_id: int):
    details = get_route_details(slot_id)
    return details["route"] if details else None


def get_route_distance(slot_id: int):
    details = get_route_details(slot_id)
    return details["distance_m"] if details else None


def get_route_details(slot_id: int):
    return _calculate_weighted_route(slot_id)


def get_multiple_route_costs(slot_ids: list[int]):
    results = []
    for slot_id in slot_ids:
        try:
            details = get_route_details(slot_id)
            results.append({
                "slot_id": slot_id,
                "available": details is not None,
                "distance_m": details["distance_m"] if details else None,
                "travel_time_s": details["travel_time_s"] if details else None,
                "requires_ramp": details["requires_ramp"] if details else None,
                "route_data_status": "SIMULATED_DEMO" if details else None,
                "topology_status": "UNVERIFIED_PLACEHOLDER" if details else None,
            })
        except ValueError as exc:
            results.append({
                "slot_id": slot_id,
                "available": False,
                "error": str(exc),
            })
    return results


def requires_ramp(slot_id: int):
    details = get_route_details(slot_id)
    return details["requires_ramp"] if details else None


def validate_route_exists(slot_id: int) -> bool:
    return get_route_details(slot_id) is not None


def get_graph_health():
    driver = _get_driver()
    with driver.session(database=settings.neo4j_database) as session:
        record = session.run(
            """
            OPTIONAL MATCH (m:Mall)
            WITH count(m) AS malls
            OPTIONAL MATCH (f:Floor)
            WITH malls, count(f) AS floors
            OPTIONAL MATCH (p:ParkingSpace)
            WITH malls, floors, count(p) AS spaces
            OPTIONAL MATCH (s:Sensor)
            WITH malls, floors, spaces, count(s) AS sensors
            OPTIONAL MATCH ()-[r:PATH]->()
            RETURN malls, floors, spaces, sensors, count(r) AS path_edges
            """
        ).single()

    return dict(record)
