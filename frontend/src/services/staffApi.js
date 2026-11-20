const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/+$/, "");

const TOKEN_KEY = "spotsync_access_token";

function endpoint(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (API_BASE_URL.endsWith("/api") && cleanPath.startsWith("/api/")) {
    return `${API_BASE_URL}${cleanPath.slice(4)}`;
  }

  return `${API_BASE_URL}${cleanPath}`;
}

export async function staffApiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;

  try {
    response = await fetch(endpoint(path), {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Unable to connect to SpotSync server.");
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.detail || data.message || "Request failed."
        : data || "Request failed.";

    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }

    throw new Error(message);
  }

  return data;
}

export const getParkingOverview = () =>
  staffApiRequest("/api/parking/overview");

export const getLiveParking = () =>
  staffApiRequest("/api/parking/live");

export const getParkingSlots = (parkingLotId) => {
  if (!parkingLotId) {
    throw new Error("A parking lot ID is required.");
  }

  return staffApiRequest(
    `/api/parking/slots?parking_lot_id=${encodeURIComponent(parkingLotId)}`
  );
};

export const updateParkingSlot = (slotId, isAvailable) =>
  staffApiRequest(`/api/parking/slots/${encodeURIComponent(slotId)}`, {
    method: "PATCH",
    body: JSON.stringify({ is_available: Boolean(isAvailable) }),
  });

export const getParkingIncidents = (parkingLotId) => {
  if (!parkingLotId) {
    throw new Error("A parking lot ID is required.");
  }

  return staffApiRequest(
    `/api/incidents/parking/${encodeURIComponent(parkingLotId)}`
  );
};

export const resolveIncident = (incidentId) =>
  staffApiRequest(`/api/incidents/${encodeURIComponent(incidentId)}/resolve`, {
    method: "POST",
  });

export const getMyNotifications = () =>
  staffApiRequest("/api/notifications");

export const getServerHealth = () =>
  staffApiRequest("/health");

export const getCurrentStaffProfile = () =>
  staffApiRequest("/api/auth/me");

export async function getAllParkingSlots() {
  const overview = await getParkingOverview();
  const lots = overview?.parking_lots || [];

  const results = await Promise.all(
    lots.map(async (lot) => {
      const data = await getParkingSlots(lot.id);
      return {
        parkingLot: lot,
        slots: data?.slots || [],
      };
    })
  );

  return results;
}

export async function getAllParkingIncidents() {
  const overview = await getParkingOverview();
  const lots = overview?.parking_lots || [];

  const results = await Promise.all(
    lots.map(async (lot) => {
      const data = await getParkingIncidents(lot.id);
      return data?.incidents || data || [];
    })
  );

  return results.flat();
}

const OFFICIAL_BAY_IDS = [
  "B1-A1", "B1-A2", "B1-A3",
  "B2-A1", "B2-A2", "B2-A3", "B2-A4",
];

export async function getOfficialParkingSpaces() {
  const results = await getAllParkingSlots();
  const backendSlots = results.flatMap(result => result.slots || []);

  return OFFICIAL_BAY_IDS.map((bayId) => {
    const slot = backendSlots.find(
      item => String(item.slot_number).trim().toUpperCase() === bayId
    );

    return {
      id: bayId,
      floor: bayId.startsWith("B1") ? "B1" : "B2",
      status: !slot
        ? "UNKNOWN"
        : slot.is_available === true
          ? "AVAILABLE"
          : "UNKNOWN",
      backendSlotId: slot?.id ?? null,
      sensor: "—",
    };
  });
}

export async function getStaffIncidents() {
  const results = await getAllParkingIncidents();

  return results.map((incident) => ({
    id: incident.id,
    parkingLotId: incident.parking_lot_id,
    sensorId: incident.sensor_id ?? null,
    type: incident.incident_type,
    severity: incident.severity,
    status: incident.status,
    description: incident.description || "",
  }));
}

export async function getStaffNotifications() {
  const data = await getMyNotifications();

  return Array.isArray(data)
    ? data
    : data?.notifications || [];
}


export const submitSensorEvent = (event) =>
  staffApiRequest("/api/sensors/events", {
    method: "POST",
    body: JSON.stringify(event),
  });
