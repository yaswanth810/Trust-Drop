import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import ValidatorDashboard from './pages/ValidatorDashboard';
import MyDonations from './pages/MyDonations';

export default function App() {
  return (
    <BrowserRouter>
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
            success: {
              iconTheme: {
                primary: '#00C896',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/campaign/:id" element={<CampaignDetail />} />
            <Route path="/create" element={<CreateCampaign />} />
            <Route path="/validator" element={<ValidatorDashboard />} />
            <Route path="/my-donations" element={<MyDonations />} />
          </Routes>
        </main>
      </Web3Provider>
    </BrowserRouter>
  );
}
