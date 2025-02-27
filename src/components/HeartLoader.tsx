interface HeartLoaderProps {
  text?: string;
}

const HeartLoader = ({ text = "Disconnecting..." }: HeartLoaderProps) => {
  // Replace hearts with celebration elements
  const elements = Array.from({ length: 3 }, (_, i) => ({
    left: 45 + (i - 1) * 5,
    top: 45 + Math.sin(i * (Math.PI / 3)) * 2,
    delay: i * 0.2,
    duration: 3 + i * 0.5,
    emoji: ["✨", "🎁", "🎊"][i % 3],
  }));

  return (
    <div className="fixed inset-0 bg-amber-100/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-48 h-48">
        {/* Animated elements */}
        {elements.map((element, i) => (
          <div
            key={i}
            className="absolute animate-float text-amber-400"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animationDuration: `${element.duration}s`,
              animationDelay: `${element.delay}s`,
              fontSize: "2rem",
              opacity: 0.8,
            }}
          >
            {element.emoji}
          </div>
        ))}
        <p className="absolute bottom-0 left-0 right-0 mt-4 text-amber-600 font-medium text-center animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );
};

export default HeartLoader;
