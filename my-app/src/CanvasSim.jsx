import { useRef, useEffect, useState } from "react";

import { CircleObstacle } from "./CircleObstacle.js";
import { SquareObstacle } from "./SquareObstacle.js";
import { TriangleObstacle } from "./TriangleObstacle.js";
import { Particle } from "./Particle.js";

export default function CanvasSim({ flowSpeed, numParticles }) {
  const canvasRef = useRef(null);
  const obstaclesRef = useRef([]);
  const selectedObstacleRef = useRef(null);
  const particlesRef = useRef([]);
  const addingRef = useRef(false);

  const [adding, setAdding] = useState(false);
  const [selectedShape, setSelectedShape] = useState("circle");
  const MAX_SHAPES = 8;

  const selectedShapeRef = useRef(selectedShape);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // --- Initialize obstacles ---
    obstaclesRef.current = [
      new CircleObstacle(canvas.width / 2, canvas.height / 2, 60, flowSpeed),
      new SquareObstacle(
        canvas.width / 4,
        canvas.height / 4,
        60,
        flowSpeed,
        Math.PI / 6,
      ),
      new TriangleObstacle(
        canvas.width * 0.75,
        canvas.height * 0.6,
        60,
        flowSpeed,
        Math.PI,
      ),
    ];

    const obstacles = obstaclesRef.current;

    // --- Initialize particles ---
    particlesRef.current = [];
    for (let i = 0; i < numParticles; i++) {
      particlesRef.current.push(new Particle(canvas, obstaclesRef));
    }

    // --- Resize handler ---
    function handleResize() {
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const scaleX = canvas.width / oldWidth;
      const scaleY = canvas.height / oldHeight;

      for (const p of particlesRef.current) {
        p.x *= scaleX;
        p.y *= scaleY;
      }

      for (const obs of obstacles) {
        obs.cx *= scaleX;
        obs.cy *= scaleY;
      }
    }

    window.addEventListener("resize", handleResize);

    // --- Mouse interaction ---
    let dragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let rotating = false;
    let rotationStartAngle = 0;
    let mouseStartAngle = 0;
    let resizing = false;
    let resizeStartMouseDist = 0;
    let resizeStartSize = 0;

    function getMousePos(e) {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function handleMouseDown(e) {
      const { x, y } = getMousePos(e);

      if (addingRef.current) {
        console.log(selectedShape);
        addShape(x, y);
        addingRef.current = false;
        canvasRef.current.style.cursor = "default";
        return;
      }

      let found = null;
      for (const obs of obstacles) {
        if (obs.contains(x, y)) {
          found = obs;
          break;
        }
      }

      selectedObstacleRef.current = found;

      if (!found) return;

      if (e.shiftKey) {
        rotating = true;
        mouseStartAngle = Math.atan2(y - found.cy, x - found.cx);
        rotationStartAngle = found.angle;
      } else if (e.altKey) {
        resizing = true;
        resizeStartMouseDist = Math.hypot(x - found.cx, y - found.cy);
        resizeStartSize = found.size;
      } else {
        dragging = true;
        dragOffsetX = x - found.cx;
        dragOffsetY = y - found.cy;
      }
    }

    function handleMouseMove(e) {
      const obs = selectedObstacleRef.current;
      if (!obs) return;

      const { x, y } = getMousePos(e);

      if (dragging) {
        obs.cx = x - dragOffsetX;
        obs.cy = y - dragOffsetY;
      }
      if (rotating) {
        const currentAngle = Math.atan2(y - obs.cy, x - obs.cx);
        obs.angle = rotationStartAngle + (currentAngle - mouseStartAngle);
      }
      if (resizing) {
        const currentDist = Math.hypot(x - obs.cx, y - obs.cy);
        obs.size = resizeStartSize * (currentDist / resizeStartMouseDist);
      }
    }

    function handleMouseUp() {
      dragging = false;
      rotating = false;
      resizing = false;
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    // --- Animation ---
    let rafId;
    function animate() {
      ctx.fillStyle = "rgba(11,16,32,0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const obs of obstaclesRef.current) {
        const isSelected = obs === selectedObstacleRef.current;
        obs.draw(ctx, isSelected);
      }

      for (const p of particlesRef.current) {
        p.update();
        p.draw(ctx);
      }

      rafId = requestAnimationFrame(animate);
    }

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }, []); // run once

  // --- Update obstacles when flowSpeed changes ---
  useEffect(() => {
    for (const obs of obstaclesRef.current) {
      obs.U = flowSpeed;
    }
  }, [flowSpeed]);

  // --- Update particles when numParticles changes ---
  useEffect(() => {
    const canvas = canvasRef.current;
    particlesRef.current = [];
    for (let i = 0; i < numParticles; i++) {
      particlesRef.current.push(new Particle(canvas, obstaclesRef));
    }
  }, [numParticles]);

  useEffect(() => {
    selectedShapeRef.current = selectedShape;
  }, [selectedShape]);

  useEffect(() => {
    addingRef.current = adding;
  }, [adding]);

  function addShape(x = 200, y = 200) {
    if (obstaclesRef.current.length >= MAX_SHAPES) {
      alert("Maximum number of shapes reached!");
      return;
    }
    let newShape;
    const size = 60; // default size
    const angle = 0; // default rotation

    switch (selectedShapeRef.current) {
      case "circle":
        newShape = new CircleObstacle(x, y, size, flowSpeed);
        break;
      case "square":
        newShape = new SquareObstacle(x, y, size, flowSpeed, angle);
        break;
      case "triangle":
        newShape = new TriangleObstacle(x, y, size, flowSpeed, angle);
        break;
      default:
        return;
    }

    obstaclesRef.current.push(newShape);
    selectedObstacleRef.current = newShape; // select it immediately
  }

  function removeSelectedShape() {
    const obs = selectedObstacleRef.current;
    if (!obs) return;

    obstaclesRef.current = obstaclesRef.current.filter((o) => o !== obs);
    console.log("removing!", selectedObstacleRef.current);
    selectedObstacleRef.current = null;
  }

  return (
    <div className="relative">
      {/* Sidebar / buttons */}
      <div className="absolute top-4 left-4 z-10 space-y-2 bg-white p-2 rounded shadow">
        <div className="space-x-2">
          {adding && (
            <button onClick={() => setSelectedShape("circle")}>Circle</button>
          )}
          {adding && (
            <button onClick={() => setSelectedShape("square")}>Square</button>
          )}
          {adding && (
            <button onClick={() => setSelectedShape("triangle")}>
              Triangle
            </button>
          )}
        </div>

        <div className="space-x-2 mt-2">
          <button
            onClick={() => {
              setAdding(true);
              canvasRef.current.style.cursor = "crosshair";
            }}
          >
            Add Shape
          </button>
          <button onClick={() => removeSelectedShape()}>Remove Selected</button>
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} id="flowCanvas" />
    </div>
  );
}
