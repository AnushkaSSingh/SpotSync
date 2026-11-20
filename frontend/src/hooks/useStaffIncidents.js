import { useCallback, useEffect, useState } from "react";
import { getStaffIncidents, resolveIncident } from "../services/staffApi";

export function useStaffIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshIncidents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getStaffIncidents();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load incidents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshIncidents();
  }, [refreshIncidents]);

  const resolveStaffIncident = async (incidentId) => {
    await resolveIncident(incidentId);
    await refreshIncidents();
  };

  return {
    incidents,
    loading,
    error,
    refreshIncidents,
    resolveStaffIncident,
  };
}
