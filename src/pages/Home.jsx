import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getAllCampaigns, getPlatformStats } from '../utils/contract';
import HeroSection from '../components/HeroSection';
import StatisticsBar from '../components/StatisticsBar';
import CampaignCard from '../components/CampaignCard';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2 } from 'lucide-react';

export default function Home() {
  const { contract, isConnected } = useWeb3();
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({ totalDonated: '0', campaignCount: 0, milestonesCompleted: 0 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!contract) return;
      setLoading(true);
      try {
        const [campaignData, platformStats] = await Promise.all([
          getAllCampaigns(contract),
          getPlatformStats(contract),
        ]);
        setCampaigns(campaignData.filter(Boolean));
        setStats(platformStats);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [contract]);

  const filteredCampaigns = campaigns.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatisticsBar stats={stats} />

      {/* Campaigns Section */}
      <section id="campaigns" className="page-container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-3xl font-bold text-white mb-2">Active Campaigns</h2>
          <p className="text-gray-400">Support transparent, milestone-verified NGO campaigns</p>
        </motion.div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field !pl-11"
          />
        </div>

        {/* Campaign Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-accent animate-spin" />
          </div>
        ) : !isConnected ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">Connect your wallet to view campaigns</p>
            <p className="text-gray-500 text-sm">Connect MetaMask to browse and donate to active campaigns</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign, index) => (
              <CampaignCard key={campaign.campaignId} campaign={campaign} index={index} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">
              {searchQuery ? 'No campaigns match your search' : 'No active campaigns yet'}
            </p>
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'Try a different search term' : 'Be the first to create a campaign!'}
            </p>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="page-container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-2">How TrustDrop Works</h2>
          <p className="text-gray-400">A simple, transparent process for accountable giving</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { step: '01', title: 'NGO Creates Campaign', desc: 'Define milestones with fund allocation and deadlines' },
            { step: '02', title: 'Donors Contribute', desc: 'ETH is locked in the smart contract securely' },
            { step: '03', title: 'NGO Submits Proof', desc: 'Upload milestone completion proof to IPFS' },
            { step: '04', title: 'Validators Approve', desc: '3/5 validators verify, funds auto-release to NGO' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card p-6 text-center relative"
            >
              <div className="text-4xl font-black gradient-text mb-4 opacity-60">{item.step}</div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
