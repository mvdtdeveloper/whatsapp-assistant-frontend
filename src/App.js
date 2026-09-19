import { useState } from "react";
import Nav from "./components/Nav";
import Simulator from "./pages/Simulator";
import MasterData from "./pages/MasterData";
import Reports from "./pages/Reports";

export default function App() {
  const [tab, setTab] = useState("simulator");
  return <div className="app"><Nav active={tab} onChange={setTab} /><div className="content">
    {tab === "simulator" && <Simulator />}
    {["users", "jobs", "materials"].includes(tab) && <MasterData type={tab} />}
    {tab === "reports" && <Reports />}
  </div></div>;
}

