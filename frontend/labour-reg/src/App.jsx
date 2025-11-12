import { Routes, Route } from "react-router-dom";
import StartScreen from "./screens/start";
import LabourRegi from "./screens/labour_regi";
import ClientRegi from "./screens/client_regi";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/labour" element={<LabourRegi />} />
      <Route path="/client" element={<ClientRegi />} />
    </Routes>
  );
}
