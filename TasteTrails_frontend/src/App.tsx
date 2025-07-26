import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegisterPage from "./pages/RegisterPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import SignInPage from "./pages/SignInPage.tsx";
import ItineraryPage from "./pages/ItineraryPage.tsx";

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<LandingPage/>}></Route>
              <Route path="/register" element={<RegisterPage/>}></Route>
              <Route path="/profile/:userId" element={<ProfilePage/>}></Route>
              <Route path="/dashboard/:userId" element={<DashboardPage/>}></Route>
              <Route path="/itineraries/:userId" element={<ItineraryPage/>}></Route>
              <Route path="/login" element={<SignInPage/>}></Route>
          </Routes>
      </Router>
  )
}

export default App
