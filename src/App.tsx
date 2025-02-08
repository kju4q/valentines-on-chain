import { usePrivy } from "@privy-io/react-auth";
import LandingPage from "./components/LandingPage";
import MainPage from "./components/MainPage";
import { PrivyProvider } from "./providers/PrivyProvider";
import HeartLoader from "./components/HeartLoader";

function AppContent() {
  const { ready, authenticated } = usePrivy();

  if (!ready) {
    return <HeartLoader text="Loading..." />;
  }

  return authenticated ? <MainPage /> : <LandingPage />;
}

function App() {
  return (
    <PrivyProvider>
      <AppContent />
    </PrivyProvider>
  );
}

export default App;
