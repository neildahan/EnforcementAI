import EnforcementDashboard from './EnforcementDashboard.jsx'

// Power Apps Code App: platform integration is handled by the `powerApps()` Vite
// plugin (see vite.config.js) — no React provider wrapper is needed. Live data
// (when wired) uses `@microsoft/power-apps` via src/services/dataverse.js.
export default function App() {
  return <EnforcementDashboard />
}
