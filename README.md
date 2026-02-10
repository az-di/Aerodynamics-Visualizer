# Fluid Dynamics Simulation

An interactive 2D fluid dynamics visualization built with React and HTML5 Canvas. Watch particles flow around obstacles with realistic physics simulated using potential flow theory.

![Fluid Dynamics Demo](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=flat&logo=vite)

## Overview

This project simulates incompressible, inviscid fluid flow around various geometric obstacles. Particles flow from left to right, dynamically responding to obstacles with realistic deflection, surface sliding, and wake effects.

### Features

- **Real-time Physics Simulation** - Potential flow equations with velocity fields around obstacles
- **Interactive Obstacles** - Drag, rotate, and resize circles, squares, and triangles
- **Dynamic Particle System** - Adjustable particle count (100-5000) with smooth animation
- **Customizable Flow Speed** - Control the velocity of the fluid flow (0-5 units)
- **Surface Interactions** - Particles slide along obstacle surfaces with realistic exit trajectories
- **Modern UI** - Glassmorphic design with smooth animations and intuitive controls

## Physics Implementation

### Potential Flow Theory

The simulation uses potential flow equations to calculate velocity fields:

**Circle Obstacle:**
```
ur = U(1 - R²/r²)cos(θ)
uθ = -U(1 + R²/r²)sin(θ)
```

**Polygonal Obstacles (Square/Triangle):**
- Smooth velocity field transitions based on angular position
- Upstream diverging flow, downstream converging wake
- Edge-specific deflection for triangular geometry

### Key Physics Features

1. **Velocity Field Calculation** - Each obstacle generates a velocity field that affects nearby particles
2. **Closest Obstacle Priority** - Particles respond to the nearest obstacle to prevent field conflicts
3. **Surface Sliding** - When particles collide, they slide along the surface tangent
4. **Exit Velocity Caching** - Particles maintain deflection momentum after leaving obstacles
5. **Logarithmic Decay** - Exit velocities decay smoothly for realistic downstream behavior

## Project Structure

```
src/
├── App.jsx                  # Main application component
├── App.css                  # Global styles and animations
├── CanvasSim.jsx           # Canvas rendering and animation loop
├── UISidebar.jsx           # Control panel UI
├── Particle.js             # Particle physics and behavior
├── CircleObstacle.js       # Circular obstacle implementation
├── SquareObstacle.js       # Square obstacle with rotation
├── TriangleObstacle.js     # Triangular obstacle with rotation
├── main.jsx                # React entry point
└── index.css               # Base styles
```

## Installation

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd fluid-dynamics-sim

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Controls

**Obstacle Manipulation:**
- **Drag** - Click and drag to move obstacles
- **Rotate** - Hold `Shift` + drag to rotate (squares and triangles)
- **Resize** - Hold `Alt/Option` + drag to change size
- **Select** - Click an obstacle to select it (highlighted in yellow)

**Shape Management:**
- **Add Shape** - Click "+ Add Shape", choose type (circle/square/triangle), then click on canvas
- **Remove Shape** - Select an obstacle and click "− Remove Selected"
- **Maximum Shapes** - Limited to 8 obstacles to restrict screen cluttering

**Simulation Settings:**
- **Flow Speed** - Adjust slider (0-5) to change fluid velocity
- **Particle Count** - Adjust slider (100-5000) to control particle density

### Best Practices

- Place obstacles with spacing to see clear wake effects
- Rotate polygons to experiment with different deflection patterns!

## Technical Details

### Particle System

```javascript
class Particle {
  update()     // Calculate velocity from nearest obstacle and move
  draw(ctx)    // Render particle as small blue square
  reset()      // Reinitialize particle at random position
}
```

**Update Loop:**
1. Find closest obstacle by distance
2. Calculate velocity from that obstacle's field
3. Apply exit velocity if recently left a surface
4. Move particle by velocity vector
5. Check for collisions and handle surface interactions
6. Reset if particle exits canvas bounds

## Customization

### Adding New Obstacle Shapes

1. Create a new class extending the obstacle interface:
```javascript
export class DiamondObstacle {
  constructor(cx, cy, size, U, angle = 0) { /* ... */ }
  contains(x, y) { /* ... */ }
  distanceTo(x, y) { /* ... */ }
  velocityAt(x, y) { /* ... */ }
  handleSurfaceSliding(particle, prevX, prevY) { /* ... */ }
  draw(ctx, isSelected) { /* ... */ }
}
```

2. Import and add to shape selector in `CanvasSim.jsx`
3. Update `addShape()` function with new case

### Adjusting Physics Parameters

**In Obstacle Classes:**
- `influenceRadius` - How far the velocity field extends
- `deflectionStrength` - Magnitude of perpendicular deflection
- `_exitTimer` - Duration of exit velocity persistence

**In Particle.js:**
- Flow baseline: `vx = 2, vy = 0` (default rightward flow)
- Collision offset: `-0.5` to `2` (distance from surface after collision)

### Styling

Modify CSS variables in `App.css`:
```css
:root {
  --bg-primary: #0a0e1a;           /* Canvas background */
  --glass-bg: rgba(15, 20, 32, 0.75);  /* UI panel background */
  --accent-primary: #78b4ff;        /* Particle and UI accent color */
  --text-primary: rgba(255, 255, 255, 0.95);  /* Primary text */
}
```

## Known Limitations

1. **2D Only** - Simulation is purely two-dimensional
2. **Inviscid Flow** - No viscosity effects (boundary layers, turbulence)
3. **No Pressure Visualization** - Only velocity field is computed
4. **Obstacle Overlap** - Multiple overlapping obstacles may cause artifacts
5. **Performance** - 5000+ particles may cause frame drops on lower-end devices
6. **Accuracy** - Not mathematically accurate, given limited computing power

## Future Enhancements

- [ ] Pressure field visualization with color gradients
- [ ] Streamline rendering option
- [ ] Vortex shedding for high flow speeds
- [ ] Export simulation as video/GIF
- [ ] Custom obstacle drawing tool
- [ ] Presets for common flow scenarios
- [ ] Touch controls for mobile devices
- [ ] Viscosity parameter for Navier-Stokes simulation

## Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

**Dev Dependencies:**
- Vite 5+ (build tool)
- @vitejs/plugin-react (JSX support)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires Canvas API and ES6+ JavaScript support.

## Note

NOT a mathematically accurate depiction of fluid flow, but rather a similar visualization intended for entertainment or educational purposes

---

**Built with React + Vite + Canvas API**
