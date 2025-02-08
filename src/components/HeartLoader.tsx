interface HeartLoaderProps {
  text?: string;
}

const HeartLoader = ({ text = "Disconnecting..." }: HeartLoaderProps) => {
  const hearts = Array.from({ length: 3 }, (_, i) => ({
    left: 45 + (i - 1) * 5,
    top: 45 + Math.sin(i * (Math.PI / 3)) * 2,
    delay: i * 0.2,
    duration: 3 + i * 0.5,
  }));

  return (
    <div className="fixed inset-0 bg-pink-100/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-48 h-48">
        {/* Animated hearts */}
        {hearts.map((heart, i) => (
          <div
            key={i}
            className="absolute animate-float text-pink-400"
            style={{
              left: `${heart.left}%`,
              top: `${heart.top}%`,
              animationDuration: `${heart.duration}s`,
              animationDelay: `${heart.delay}s`,
              fontSize: "2rem",
              opacity: 0.8,
              filter: "hue-rotate(-10deg) brightness(1.2)",
            }}
          >
            ❤️
          </div>
        ))}
        <p className="absolute bottom-0 left-0 right-0 mt-4 text-pink-600 font-medium text-center animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );
};

export default HeartLoader;
