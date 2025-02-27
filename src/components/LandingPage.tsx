import { Wallet } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

const LandingPage = () => {
  const { login } = usePrivy();

  // Replace hearts with celebration elements like stars or gift boxes
  const celebrationElements = Array.from({ length: 20 }, () => ({
    left: Math.floor(Math.random() * 90) + 5,
    top: Math.floor(Math.random() * 90) + 5,
    delay: Math.random() * 5,
    duration: Math.floor(Math.random() * 10) + 10,
    // Use a mix of celebration emojis
    emoji: ["🎁", "✨", "🎊", "🎉", "🌟"][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {celebrationElements.map((element, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-10"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animationDuration: `${element.duration}s`,
              animationDelay: `${element.delay}s`,
            }}
          >
            {element.emoji}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-xl mx-auto px-4">
        <div className="text-center p-6 backdrop-blur-sm bg-white/30 rounded-xl shadow-2xl relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-600 mb-4">
            Celebrate Special Moments
          </h1>
          <p className="text-lg md:text-xl text-amber-700/80 mb-8">
            Connect your wallet to send meaningful crypto gifts for any occasion
          </p>
          <button
            onClick={login}
            className="group flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-yellow-50 text-amber-700 border border-amber-200 rounded-full hover:bg-yellow-100 hover:border-amber-300 font-semibold transition-all duration-300 hover:shadow-lg"
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
