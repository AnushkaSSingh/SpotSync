import { useCallback, useEffect, useState } from "react";
import {
  getServerHealth,
  submitSensorEvent,
} from "../services/staffApi";

export function useSystemHealth() {
  const [server, setServer] = useState({
    status: "checking",
    details: null,
    checkedAt: null,
  });

  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  const refreshHealth = useCallback(async () => {
    setChecking(true);
    setError("");

    try {
      const data = await getServerHealth();

      setServer({
        status: "online",
        details: data,
        checkedAt: new Date().toISOString(),
      });
    } catch (err) {
      setServer({
        status: "offline",
        details: null,
        checkedAt: new Date().toISOString(),
      });
      setError(err.message || "Unable to reach the SpotSync server.");
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    refreshHealth();

    const interval = setInterval(refreshHealth, 30000);
    return () => clearInterval(interval);
  }, [refreshHealth]);

  const sendSensorEvent = useCallback(async (event) => {
    return submitSensorEvent({
      sensor_id: event.sensor_id,
      slot_id: event.slot_id,
      status: event.status,
      distance_cm: event.distance_cm,
      timestamp: event.timestamp || new Date().toISOString(),
    });
  }, []);

  return {
    server,
    error,
    checking,
    refreshHealth,
    sendSensorEvent,
  };
}
