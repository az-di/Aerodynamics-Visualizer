// UISidebar.js
export default function UISidebar({
  flowSpeed,
  setFlowSpeed,
  numParticles,
  setNumParticles,
}) {
  return (
    <div
      className="sidebar-container"
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        width: "320px",
        padding: "28px",
        background: "rgba(15, 20, 32, 0.75)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(120, 180, 255, 0.15)",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        zIndex: 100,
        animation: "fadeInUp 0.6s ease-out",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2
          style={{
            margin: "0 0 6px 0",
            fontSize: "24px",
            fontWeight: "600",
            fontFamily: "Crimson Pro, serif",
            color: "rgba(255, 255, 255, 0.95)",
            letterSpacing: "-0.02em",
          }}
        >
          Fluid Dynamics
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontFamily: "JetBrains Mono, monospace",
            color: "rgba(255, 255, 255, 0.45)",
            letterSpacing: "0.02em",
          }}
        >
          SIMULATION CONTROLS
        </p>
      </div>

      {/* Flow speed slider */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "12px",
          }}
        >
          <label
            style={{
              fontSize: "15px",
              fontWeight: "400",
              color: "rgba(255, 255, 255, 0.85)",
              fontFamily: "Crimson Pro, serif",
            }}
          >
            Flow Speed
          </label>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "600",
              fontFamily: "JetBrains Mono, monospace",
              color: "#78b4ff",
              minWidth: "50px",
              textAlign: "right",
            }}
          >
            {flowSpeed.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.05"
          value={flowSpeed}
          onChange={(e) => setFlowSpeed(parseFloat(e.target.value))}
          style={{
            width: "100%",
            height: "6px",
            background:
              "linear-gradient(to right, rgba(120, 180, 255, 0.2) 0%, rgba(120, 180, 255, 0.4) 100%)",
            border: "1px solid rgba(120, 180, 255, 0.15)",
            borderRadius: "3px",
            outline: "none",
            cursor: "pointer",
            appearance: "none",
            WebkitAppearance: "none",
          }}
          className="custom-slider"
        />
      </div>

      {/* Particle count slider */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "12px",
          }}
        >
          <label
            style={{
              fontSize: "15px",
              fontWeight: "400",
              color: "rgba(255, 255, 255, 0.85)",
              fontFamily: "Crimson Pro, serif",
            }}
          >
            Particle Count
          </label>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "600",
              fontFamily: "JetBrains Mono, monospace",
              color: "#78b4ff",
              minWidth: "60px",
              textAlign: "right",
            }}
          >
            {numParticles.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="100"
          max="5000"
          step="50"
          value={numParticles}
          onChange={(e) => setNumParticles(parseInt(e.target.value))}
          style={{
            width: "100%",
            height: "6px",
            background:
              "linear-gradient(to right, rgba(120, 180, 255, 0.2) 0%, rgba(120, 180, 255, 0.4) 100%)",
            border: "1px solid rgba(120, 180, 255, 0.15)",
            borderRadius: "3px",
            outline: "none",
            cursor: "pointer",
            appearance: "none",
            WebkitAppearance: "none",
          }}
          className="custom-slider"
        />
      </div>

      {/* Info footer */}
      <div
        style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(120, 180, 255, 0.1)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            fontFamily: "JetBrains Mono, monospace",
            color: "rgba(255, 255, 255, 0.35)",
            lineHeight: "1.6",
          }}
        >
          <span style={{ display: "block", marginBottom: "4px" }}>
            ⌘ Drag to move shapes
          </span>
          <span style={{ display: "block", marginBottom: "4px" }}>
            ⇧ Shift+drag to rotate
          </span>
          <span style={{ display: "block" }}>⌥ Alt+drag to resize</span>
        </p>
      </div>

      {/* Custom slider styles */}
      <style>{`
        .custom-slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #78b4ff;
          box-shadow: 0 2px 8px rgba(120, 180, 255, 0.5);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .custom-slider::-webkit-slider-thumb:hover {
          background: #5a9fff;
          transform: scale(1.1);
          box-shadow: 0 3px 12px rgba(120, 180, 255, 0.7);
        }
        
        .custom-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border: none;
          border-radius: 50%;
          background: #78b4ff;
          box-shadow: 0 2px 8px rgba(120, 180, 255, 0.5);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .custom-slider::-moz-range-thumb:hover {
          background: #5a9fff;
          transform: scale(1.1);
          box-shadow: 0 3px 12px rgba(120, 180, 255, 0.7);
        }
      `}</style>
    </div>
  );
}
