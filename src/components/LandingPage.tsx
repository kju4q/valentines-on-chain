import { Wallet } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

const LandingPage = () => {
  const { login } = usePrivy();

  // Pre-calculate random positions for hearts
  const hearts = Array.from({ length: 20 }, () => ({
    left: Math.floor(Math.random() * 90) + 5, // 5-95% to keep hearts within bounds
    top: Math.floor(Math.random() * 90) + 5,
    delay: Math.random() * 5,
    duration: Math.floor(Math.random() * 10) + 10, // 10-20s
  }));

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 relative overflow-hidden">
      {/* Background Hearts */}
      <div className="absolute inset-0">
        {hearts.map((heart, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-10"
            style={{
              left: `${heart.left}%`,
              top: `${heart.top}%`,
              animationDuration: `${heart.duration}s`,
              animationDelay: `${heart.delay}s`,
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-xl mx-auto px-4">
        <div className="text-center p-6 backdrop-blur-sm bg-white/30 rounded-xl shadow-2xl relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-4">
            Spread love on chain
          </h1>
          <p className="text-lg md:text-xl text-pink-700/80 mb-8">
            Connect your wallet to send special crypto gifts to your loved ones
            this Valentine's Day
          </p>
          <button
            onClick={login}
            className="group flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold transition-all duration-300 hover:shadow-lg"
          >
            <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Connect Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
