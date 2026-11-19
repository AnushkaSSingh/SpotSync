OCCUPANCY_TOPIC = "spotsync/parking/{slot_id}/occupancy"
ENTRANCE_EVENT_TOPIC = "spotsync/sensors/+/events"


def occupancy_topic(slot_id: str) -> str:
    return OCCUPANCY_TOPIC.format(slot_id=slot_id)