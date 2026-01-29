import CanvasSim from "./CanvasSIm";
import UISidebar from "./UISidebar";
import { useState } from "react";

export default function App() {
  const [flowSpeed, setFlowSpeed] = useState(2);
  const [numParticles, setNumParticles] = useState(2000);

  return (
    <div className="flex">
      <UISidebar
        flowSpeed={flowSpeed}
        setFlowSpeed={setFlowSpeed}
        numParticles={numParticles}
        setNumParticles={setNumParticles}
      />
      <CanvasSim flowSpeed={flowSpeed} numParticles={numParticles} />
    </div>
  );
}
