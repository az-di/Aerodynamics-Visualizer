// UISidebar.js
export default function UISidebar({
  flowSpeed,
  setFlowSpeed,
  numParticles,
  setNumParticles,
}) {
  return (
    <div className="w-64 p-4 bg-gray-100 rounded shadow-md space-y-6">
      <h2 className="text-lg font-semibold">Simulation Controls</h2>

      {/* Flow speed slider */}
      <div>
        <label className="block mb-1 font-medium">
          Flow Speed: {flowSpeed.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="4"
          step="0.05"
          value={flowSpeed}
          onChange={(e) => setFlowSpeed(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Particle count slider */}
      <div>
        <label className="block mb-1 font-medium">
          Particle Count: {numParticles}
        </label>
        <input
          type="range"
          min="100"
          max="5000"
          step="50"
          value={numParticles}
          onChange={(e) => setNumParticles(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
