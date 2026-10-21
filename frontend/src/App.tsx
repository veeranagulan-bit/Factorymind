import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import AiAssistantPage from './pages/dashboard/AiAssistantPage';
import DocumentsPage from './pages/dashboard/DocumentsPage';
import MachinesPage from './pages/dashboard/MachinesPage';
import VectorDatabasePage from './pages/dashboard/VectorDatabasePage';
import ModelPage from './pages/dashboard/ModelPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import ArchitecturePage from './pages/dashboard/ArchitecturePage';
import AcousticAnalyzerPage from './pages/dashboard/AcousticAnalyzerPage';

function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-base selection:bg-brand-green selection:text-black font-sans text-zinc-900">
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard Routes with relatable theme */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="assistant" element={<AiAssistantPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="machines" element={<MachinesPage />} />
            <Route path="acoustics" element={<AcousticAnalyzerPage />} />
            <Route path="vectordb" element={<VectorDatabasePage />} />
            <Route path="model" element={<ModelPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="architecture" element={<ArchitecturePage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
