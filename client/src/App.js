import Container from "react-bootstrap/Container";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ApiProvider from "./contexts/ApiProvider";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import GeneratorPage from "./pages/GeneratorPage";
import GaleriePage from "./pages/GaleriePage";
import ProfilPage from "./pages/ProfilPage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import ChangePasswordPage from './pages/ChangePasswordPage';
import FlashProvider from "./contexts/FlashProvider";
import UserProvider from "./contexts/UserProvider";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

export default function App() {
  return (
    <Container fluid className="App">
      <BrowserRouter>
        <FlashProvider>
          <ApiProvider>
            <UserProvider>
              <Header />
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <RegistrationPage />
                    </PublicRoute>
                  }
                />
                {/* page home je dostupná bez přihlášení */}
                <Route path="/home" element={<HomePage />} />
                {/* ostatní strany jsou dostupné pouze s přihlášením, pokud není user přihlášen tak je přesměrován na login page */}
                <Route path="*" element={
                <PrivateRoute>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/generator" element={<GeneratorPage />} />
                    <Route path="/galerie" element={<GaleriePage />} />
                    <Route path="/profil/:userid" element={<ProfilPage />} />
                    <Route path="/password" element={<ChangePasswordPage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </PrivateRoute>
                  } />
              </Routes>
            </UserProvider>
          </ApiProvider>
        </FlashProvider>
      </BrowserRouter>
    </Container>
  );
}
