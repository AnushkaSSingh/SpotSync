import { useCallback, useEffect, useState } from "react";
import { getStaffNotifications } from "../services/staffApi";

export function useStaffNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getStaffNotifications();
      setNotifications(data.map((item) => ({
        ...item,
        id: item.id,
        title: item.title || "Notification",
        message: item.message || "",
        type: item.notification_type || "info",
        read: Boolean(item.is_read),
        createdAt: item.created_at || null,
      })));
    } catch (err) {
      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  return {
    notifications,
    loading,
    error,
    refreshNotifications,
  };
}
