import './App.css';
import LandingPage from './pages/LandingPage/LandingPage';
import DashBoard from './pages/DashBoard/DashBoard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/grid-intelligence" element={<LandingPage />} />
        <Route path="/working" element={<LandingPage />} />
        <Route path="/features" element={<LandingPage />} />
        <Route path="/operations" element={<LandingPage />} />
        <Route path="/faq" element={<LandingPage />} />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/dashboard/:tab" element={<DashBoard />} />
        <Route path="/Dashboard" element={<DashBoard />} />
        <Route path="/Dashboard/:tab" element={<DashBoard />} />

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
