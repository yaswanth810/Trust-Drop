import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getAllCampaigns, getDonationAmount } from '../utils/contract';
import { formatEth, calculatePercentage, getMilestoneStatus, getEtherscanAddressUrl } from '../utils/helpers';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Heart, Wallet, Loader2, ExternalLink, Target, ArrowRight } from 'lucide-react';

export default function MyDonations() {
  const { contract, account, isConnected, connectWallet } = useWeb3();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDonated, setTotalDonated] = useState('0');

  useEffect(() => {
    async function fetchDonations() {
      if (!contract || !account) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const allCampaigns = await getAllCampaigns(contract);
        const userDonations = [];
        let total = BigInt(0);

        for (const campaign of allCampaigns) {
          if (!campaign) continue;
          const amount = await getDonationAmount(contract, campaign.campaignId, account);
          if (amount > BigInt(0)) {
            userDonations.push({
              ...campaign,
              userDonation: amount,
            });
            total += amount;
          }
        }

        setDonations(userDonations);
        setTotalDonated(formatEth(total));
      } catch (err) {
        console.error('Error fetching donations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDonations();
  }, [contract, account]);

  return (
    <div className="min-h-screen pt-24">
      <div className="page-container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Heart size={28} className="text-accent" />
              My Donations
            </h1>
            <p className="text-gray-400">Track your contributions and their impact</p>
          </div>

          {!isConnected ? (
            <div className="glass-card p-12 text-center">
              <Wallet size={48} className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-6">Connect MetaMask to view your donation history</p>
              <button onClick={connectWallet} className="btn-accent">
                <Wallet size={18} />
                Connect Wallet
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="text-accent animate-spin" />
            </div>
          ) : donations.length > 0 ? (
            <>
              {/* Total Summary */}
              <div className="glass-card p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Donated</p>
                    <p className="text-3xl font-bold gradient-text">{totalDonated} ETH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Campaigns Supported</p>
                    <p className="text-3xl font-bold text-white">{donations.length}</p>
                  </div>
                </div>
              </div>

              {/* Donation List */}
              <div className="space-y-4">
                {donations.map((donation, index) => {
                  const percentage = calculatePercentage(donation.raisedFunds, donation.totalFunds);
                  const completedMilestones = donation.milestones
                    ? donation.milestones.filter((m) => m.isApproved || m.fundsReleased).length
                    : 0;

                  return (
                    <motion.div
                      key={donation.campaignId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={`/campaign/${donation.campaignId}`} className="block group">
                        <div className="glass-card p-6">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">
                                {donation.title}
                              </h3>
                              <p className="text-gray-400 text-sm mt-1">
                                Campaign #{donation.campaignId}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-accent font-bold">{formatEth(donation.userDonation)} ETH</p>
                              <p className="text-gray-500 text-xs">your contribution</p>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">{formatEth(donation.raisedFunds)} / {formatEth(donation.totalFunds)} ETH</span>
                              <span className="text-accent">{percentage}%</span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>

                          {/* Milestones */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Target size={14} />
                              {completedMilestones}/{donation.milestoneCount} milestones completed
                            </div>
                            <span className="text-accent flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                              View Details
                              <ArrowRight size={14} />
                            </span>
                          </div>

                          {/* Milestone Dots */}
                          <div className="flex gap-1.5 mt-3">
                            {donation.milestones && donation.milestones.map((m, i) => {
                              const status = getMilestoneStatus(m);
                              return (
                                <div
                                  key={i}
                                  className={`flex-1 h-1.5 rounded-full ${
                                    m.fundsReleased ? 'bg-green-400' :
                                    m.isApproved ? 'bg-accent' :
                                    m.ipfsHash ? 'bg-blue-400' :
                                    'bg-gray-700'
                                  }`}
                                  title={`${status.label}: ${m.description}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <Heart size={48} className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Donations Yet</h3>
              <p className="text-gray-400 mb-6">You haven't donated to any campaigns yet</p>
              <Link to="/" className="btn-accent">
                Browse Campaigns
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
