import { usePrivy } from "@privy-io/react-auth";
import LandingPage from "./components/LandingPage";
import MainPage from "./components/MainPage";
import { PrivyProvider } from "./providers/PrivyProvider";

function AppContent() {
  const { ready, authenticated } = usePrivy();

  if (!ready) {
    return null; // or a loading spinner
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
