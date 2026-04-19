import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import StatsPage from "./pages/StatsPage";

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          LinkTD
        </div>
        <nav className="nav-links">
          <Link to="/">Shorten Link</Link>
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stats/:shortCode" element={<StatsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
