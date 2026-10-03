import { useState } from "react";
import Nav from "./components/Nav";
import Simulator from "./pages/Simulator";
import MasterData from "./pages/MasterData";
import Reports from "./pages/Reports";
import More from "./pages/More";

export default function App() {
  const [tab, setTab] = useState("simulator");

  return (
    <div className="app">
      <Nav active={tab} onChange={setTab} />
      <main className={`content ${tab === "simulator" ? "chat-content" : ""}`}>
        {tab === "simulator" && <Simulator />}
        {["users", "jobs", "materials"].includes(tab) && (
          <MasterData
            type={tab}
            onBack={tab === "users" ? null : () => setTab("more")}
          />
        )}
        {tab === "reports" && <Reports />}
        {tab === "more" && <More onOpen={setTab} />}
      </main>
    </div>
  );
}
