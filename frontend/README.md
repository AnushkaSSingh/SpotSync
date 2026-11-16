# SpotSync Staff Frontend (UI-only)

A fresh React + Vite staff-console frontend for the SpotSync smart parking project.

## Included pages
1. Staff Login
2. Staff Dashboard
3. New Vehicle Entry
4. Parking Layout
5. Smart Allocation
6. Digital Tickets
7. Active Parking
8. Exit Management
9. Parking History
10. Mall Navigation
11. Settings

## Scope
- Frontend-only React application.
- Uses local sample data and in-memory interactions.
- No FastAPI calls, database connections, real authentication, WebSockets, MQTT, or hardware integration.
- Login is a visual/demo gate: enter any non-empty password.
- Refreshing the browser resets demo changes.

## Run locally
```powershell
npm install
npm run dev
```

## Production build
```powershell
npm run build
```

The UI uses the SpotSync purple/lavender visual direction from the supplied references. The page features and parking workflow are represented with local demo data and must be connected to the real backend only in a separately approved integration phase.
