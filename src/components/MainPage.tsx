import { usePrivy } from "@privy-io/react-auth";

const MainPage = () => {
  const { user, logout } = usePrivy();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-pink-600">
            Welcome, {user?.wallet?.address?.slice(0, 6)}...
            {user?.wallet?.address?.slice(-4)}
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
        {/* Add your main page content here */}
      </div>
    </div>
  );
};

export default MainPage;
