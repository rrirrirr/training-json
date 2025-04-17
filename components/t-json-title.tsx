export default function TJsonTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  // Use the hook, passing the h1 ref as the target
  const canvasRef = useParticleEffect(titleRef)

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
        aria-hidden="true"
      />
      <h1
        ref={titleRef}
        className="relative z-10 px-4 text-center text-5xl sm:text-6xl font-bold text-transparent md:text-7xl whitespace-nowrap"
        style={{
          animation: "flicker 0.3s infinite alternate",
          color: "#FF4500", // Base color for flicker
        }}
      >
        T-JSON
      </h1>
      {/* Flicker animation styles */}
      <style jsx global>{`
        @keyframes flicker {
          0%,
          100% {
            color: #ff4500;
            text-shadow:
              0 0 5px rgba(255, 69, 0, 0.6),
              0 0 15px rgba(255, 69, 0, 0.4),
              0 0 30px rgba(255, 140, 0, 0.3);
          }
          50% {
            color: #ff8c00;
            text-shadow:
              0 0 8px rgba(255, 140, 0, 0.7),
              0 0 20px rgba(255, 140, 0, 0.5),
              0 0 40px rgba(255, 69, 0, 0.3);
          }
        }
        h1[style*="animation: flicker"] {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          user-select: text;
        }
        /* Minimal body styles if needed globally */
        /* body { overflow: hidden; background-color: #000; } */
      `}</style>
    </div>
  )
}
