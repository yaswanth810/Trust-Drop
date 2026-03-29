import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import ValidatorDashboard from './pages/ValidatorDashboard';
import MyDonations from './pages/MyDonations';
import Analytics from './pages/Analytics';
import NgoProfile from './pages/NgoProfile';
import Footer from './components/Footer';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.main key={location.pathname} {...pageTransition}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/campaign/:id" element={<CampaignDetail />} />
          <Route path="/create" element={<CreateCampaign />} />
          <Route path="/validator" element={<ValidatorDashboard />} />
          <Route path="/my-donations" element={<MyDonations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ngo/:address" element={<NgoProfile />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Web3Provider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(26, 58, 107, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '12px',
                padding: '14px 18px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#00C896', secondary: '#fff' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
          <Navbar />
          <AnimatedRoutes />
        </Web3Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
