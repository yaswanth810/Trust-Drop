import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getAllCampaigns } from '../utils/contract';
import { formatEth, shortenAddress, formatDate } from '../utils/helpers';
import { ethers } from 'ethers';
import TrustScoreBadge from '../components/TrustScoreBadge';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Target, Wallet, TrendingUp, Calendar,
  CheckCircle2, Clock, Loader2, ExternalLink, Users
} from 'lucide-react';
import Footer from '../components/Footer';

export default function NgoProfile() {
  const { address } = useParams();
  const { contract, trustScoreContract } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [ngoStats, setNgoStats] = useState({});
  const [trustScore, setTrustScore] = useState(0);

  useEffect(() => {
    async function fetchNgoData() {
      if (!contract || !address) return;
      setLoading(true);
      try {
        const allCampaigns = await getAllCampaigns(contract);
        const ngoCampaigns = allCampaigns
          .filter(Boolean)
          .filter((c) => c.ngoAddress?.toLowerCase() === address.toLowerCase());

        setCampaigns(ngoCampaigns);

        // Calculate stats
        let totalRaised = 0;
        let totalMilestones = 0;
        let completedMilestones = 0;
        let onTimeMilestones = 0;
        let completedCampaigns = 0;

        ngoCampaigns.forEach((c) => {
          totalRaised += parseFloat(ethers.formatEther(c.raisedFunds || '0'));
          const milestones = c.milestones || [];
          totalMilestones += milestones.length;
          const completeMs = milestones.filter((m) => m.fundsReleased || m.isApproved);
          completedMilestones += completeMs.length;
          onTimeMilestones += completeMs.length; // Simplified
          if (milestones.every((m) => m.fundsReleased)) completedCampaigns++;
        });

        // Calculate TrustScore — try on-chain first, fallback to local
        let score = 0;
        if (trustScoreContract) {
          try {
            const onChainScore = await trustScoreContract.getTrustScore(address);
            score = Number(onChainScore);
          } catch (e) {
            // Fallback to local calculation
            score += onTimeMilestones * 10;
            score += completedCampaigns * 20;
            score = Math.min(Math.max(score, 0), 100);
          }
        } else {
          score += onTimeMilestones * 10;
          score += completedCampaigns * 20;
          score = Math.min(Math.max(score, 0), 100);
        }
        setTrustScore(score);

        setNgoStats({
          totalRaised: totalRaised.toFixed(4),
          campaignCount: ngoCampaigns.length,
          completedCampaigns,
          totalMilestones,
          completedMilestones,
          completionRate: totalMilestones > 0
            ? Math.round((completedMilestones / totalMilestones) * 100)
            : 0,
        });
      } catch (err) {
        console.error('Error fetching NGO data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNgoData();
  }, [contract, address]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 size={40} className="text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-8">
      <div className="page-container">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Campaigns
        </Link>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <TrustScoreBadge score={trustScore} size="xl" />

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">NGO Profile</h1>
              <a
                href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline flex items-center gap-1 justify-center md:justify-start"
              >
                {address}
                <ExternalLink size={14} />
              </a>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="glass-card-static p-4 text-center">
                  <TrendingUp size={18} className="text-accent mx-auto mb-2" />
                  <p className="text-xl font-bold">{ngoStats.totalRaised} ETH</p>
                  <p className="text-gray-400 text-xs mt-1">Total Raised</p>
                </div>
                <div className="glass-card-static p-4 text-center">
                  <Target size={18} className="text-accent mx-auto mb-2" />
                  <p className="text-xl font-bold">{ngoStats.campaignCount}</p>
                  <p className="text-gray-400 text-xs mt-1">Campaigns</p>
                </div>
                <div className="glass-card-static p-4 text-center">
                  <CheckCircle2 size={18} className="text-green-400 mx-auto mb-2" />
                  <p className="text-xl font-bold">{ngoStats.completionRate}%</p>
                  <p className="text-gray-400 text-xs mt-1">Milestone Rate</p>
                </div>
                <div className="glass-card-static p-4 text-center">
                  <Wallet size={18} className="text-blue-400 mx-auto mb-2" />
                  <p className="text-xl font-bold">{ngoStats.completedCampaigns}</p>
                  <p className="text-gray-400 text-xs mt-1">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Campaign History */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-accent" />
          Campaign History
        </h2>

        {campaigns.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Users size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No campaigns found for this NGO</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign, i) => {
              const raised = parseFloat(ethers.formatEther(campaign.raisedFunds || '0'));
              const total = parseFloat(ethers.formatEther(campaign.totalFunds || '0'));
              const pct = total > 0 ? Math.round((raised / total) * 100) : 0;
              const allComplete = (campaign.milestones || []).every(m => m.fundsReleased);

              return (
                <motion.div
                  key={campaign.campaignId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/campaign/${campaign.campaignId}`} className="block glass-card p-5 hover:border-accent/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-1">{campaign.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-1">{campaign.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`badge ${allComplete ? 'badge-released' : 'badge-approved'}`}>
                          {allComplete ? 'Completed' : 'Active'}
                        </span>
                        <p className="text-sm mt-2">{raised.toFixed(4)} / {total.toFixed(4)} ETH ({pct}%)</p>
                      </div>
                    </div>
                    <div className="progress-bar mt-3">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
