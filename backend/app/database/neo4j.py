import logging
from typing import Optional

from neo4j import Driver, GraphDatabase

from app.core.config import settings


logger = logging.getLogger(__name__)

_driver: Optional[Driver] = None


def initialize_neo4j() -> bool:
    """Create and verify the Neo4j driver when credentials are configured."""
    global _driver

    if _driver is not None:
        return True

    if not settings.neo4j_uri or not settings.neo4j_password:
        logger.info(
            "Neo4j is not configured. Graph features will remain unavailable."
        )
        return False

    candidate = None
    try:
        candidate = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_username, settings.neo4j_password),
            connection_timeout=settings.neo4j_connection_timeout,
        )
        candidate.verify_connectivity()
        _driver = candidate
        logger.info("Neo4j connection verified successfully.")
        return True
    except Exception:
        if candidate is not None:
            candidate.close()
        logger.exception("Neo4j connection could not be established.")
        return False


def get_neo4j_driver() -> Optional[Driver]:
    """Return the initialized driver, or None when Neo4j is unavailable."""
    return _driver


def verify_neo4j_connection() -> bool:
    """Check connectivity using the initialized driver."""
    if _driver is None:
        return False

    try:
        _driver.verify_connectivity()
        return True
    except Exception:
        logger.exception("Neo4j connectivity verification failed.")
        return False


def close_neo4j() -> None:
    """Close the driver during application shutdown."""
    global _driver

    if _driver is not None:
        _driver.close()
        _driver = None
        logger.info("Neo4j driver closed.")
