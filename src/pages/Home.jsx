import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getAllCampaigns, getPlatformStats } from '../utils/contract';
import HeroSection from '../components/HeroSection';
import StatisticsBar from '../components/StatisticsBar';
import CampaignCard from '../components/CampaignCard';
import SkeletonCard from '../components/SkeletonCard';
import ActivityFeed from '../components/ActivityFeed';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import {
  Search, Loader2, SlidersHorizontal, X, ArrowUpDown,
  ChevronDown, Filter
} from 'lucide-react';

const CATEGORIES = ['All', 'Relief', 'Education', 'Medical', 'Infrastructure', 'Environment'];
const STATUSES = ['All', 'Active', 'Completed', 'Fully Funded'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Most Recently Created' },
  { value: 'funded', label: 'Most Funded (%)' },
  { value: 'ending', label: 'Ending Soonest' },
  { value: 'donors', label: 'Most Donors' },
];

export default function Home() {
  const { contract, isConnected } = useWeb3();
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({ totalDonated: '0', campaignCount: 0, milestonesCompleted: 0 });
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Read filters from URL
  const searchQuery = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status') || 'All';
  const categoryFilter = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sort') || 'newest';

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === '' || value === 'All' || value === 'newest') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const activeFilterCount = [
    statusFilter !== 'All' ? 1 : 0,
    categoryFilter !== 'All' ? 1 : 0,
    sortBy !== 'newest' ? 1 : 0,
    searchQuery ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

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

  // Filter + sort campaigns
  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      const cat = categoryFilter.toLowerCase();
      result = result.filter((c) => {
        const text = `${c.title} ${c.description}`.toLowerCase();
        return text.includes(cat);
      });
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter((c) => {
        const raised = parseFloat(ethers.formatEther(c.raisedFunds || '0'));
        const total = parseFloat(ethers.formatEther(c.totalFunds || '0'));
        const pct = total > 0 ? (raised / total) * 100 : 0;
        const allComplete = c.milestones?.every((m) => m.fundsReleased);

        switch (statusFilter) {
          case 'Active': return !allComplete && pct < 100;
          case 'Completed': return allComplete;
          case 'Fully Funded': return pct >= 100;
          default: return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'funded': {
          const pctA = parseFloat(ethers.formatEther(a.raisedFunds || '0')) / Math.max(parseFloat(ethers.formatEther(a.totalFunds || '1')), 0.0001);
          const pctB = parseFloat(ethers.formatEther(b.raisedFunds || '0')) / Math.max(parseFloat(ethers.formatEther(b.totalFunds || '1')), 0.0001);
          return pctB - pctA;
        }
        case 'ending':
          return (a.deadline || Infinity) - (b.deadline || Infinity);
        case 'donors':
          return (b.donorCount || 0) - (a.donorCount || 0);
        case 'newest':
        default:
          return (b.campaignId || 0) - (a.campaignId || 0);
      }
    });

    return result;
  }, [campaigns, searchQuery, statusFilter, categoryFilter, sortBy]);

  // Debounced search handler
  const [searchInput, setSearchInput] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam('q', searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Active Campaigns</h2>
          <p className="text-gray-400">Support transparent, milestone-verified NGO campaigns</p>
        </motion.div>

        {/* Search + Filter Controls */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns by name or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field !pl-11 !pr-10"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); updateParam('q', ''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input-field !pr-10 appearance-none cursor-pointer min-w-[200px]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary !py-2.5 !px-5 ${showFilters ? 'border-accent/50 text-accent' : ''}`}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card-static p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Filter Campaigns</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-accent text-sm hover:underline">
                  Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Filter */}
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateParam('status', status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        statusFilter === status
                          ? 'bg-accent text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateParam('category', cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        categoryFilter === cat
                          ? 'bg-accent text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Campaign Count */}
        {isConnected && !loading && (
          <p className="text-gray-500 text-sm mb-6">
            Showing {filteredCampaigns.length} of {campaigns.length} campaigns
          </p>
        )}

        {/* Campaign Grid + Activity Feed */}
        <div className="flex gap-8">
          {/* Campaign Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} />
                ))}
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
                  {searchQuery || activeFilterCount > 0 ? 'No campaigns match your filters' : 'No active campaigns yet'}
                </p>
                <p className="text-gray-500 text-sm">
                  {searchQuery || activeFilterCount > 0 ? 'Try adjusting your search or filters' : 'Be the first to create a campaign!'}
                </p>
              </div>
            )}
          </div>

          {/* Activity Feed (desktop only) */}
          {isConnected && (
            <div className="hidden xl:block w-80 flex-shrink-0">
              <ActivityFeed />
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="page-container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-2">How TrustDrop Works</h2>
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
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
