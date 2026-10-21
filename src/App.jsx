import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { ModalProvider } from "./context/ModalContext";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/common/ScrollToTop";
import { seedInitialDormitoriesIfEmpty } from "./utils/seedData";

function App() {
  useEffect(() => {
    seedInitialDormitoriesIfEmpty();
  }, []);
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ModalProvider>
        <SiteSettingsProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </SiteSettingsProvider>
      </ModalProvider>
    </BrowserRouter>
  );
}

export default App;