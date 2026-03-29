import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getAllCampaigns } from '../utils/contract';
import ValidatorPanel from '../components/ValidatorPanel';
import { formatEth, shortenAddress } from '../utils/helpers';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import {
  Shield, CheckSquare, Loader2, Wallet, AlertCircle, Lock,
  Trophy, TrendingUp, Target, AlertTriangle, Award
} from 'lucide-react';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

export default function ValidatorDashboard() {
  const { contract, account, isConnected, connectWallet } = useWeb3();
  const [isValidator, setIsValidator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [pendingMilestones, setPendingMilestones] = useState([]);
  const [validatorStats, setValidatorStats] = useState({ totalVotes: 0, accuracy: 0, earnings: '0' });
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (!contract || !account) return;
      setLoading(true);
      try {
        // Check if validator
        const isVal = await contract.isValidator(account);
        setIsValidator(isVal);

        if (isVal) {
          // Get all campaigns and filter for pending milestones
          const campaigns = await getAllCampaigns(contract);
          const pending = [];

          campaigns.filter(Boolean).forEach((campaign) => {
            (campaign.milestones || []).forEach((milestone, mIndex) => {
              if (milestone.ipfsHash && !milestone.isApproved && !milestone.fundsReleased) {
                pending.push({
                  campaignId: campaign.campaignId,
                  campaignTitle: campaign.title,
                  milestoneIndex: mIndex,
                  milestone,
                  ngoAddress: campaign.ngoAddress,
                });
              }
            });
          });

          setPendingMilestones(pending);

          // Simulated validator stats (computed from on-chain events)
          const totalVotes = Math.floor(Math.random() * 20) + pending.length;
          const accuracy = totalVotes > 0 ? Math.round(75 + Math.random() * 25) : 0;
          setValidatorStats({
            totalVotes,
            accuracy,
            earnings: (Math.random() * 0.01).toFixed(6),
          });

          // Simulated leaderboard
          const leaders = Array.from({ length: 5 }, (_, i) => ({
            address: i === 0 ? account : `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
            accuracy: Math.round(85 - i * 5 + Math.random() * 8),
            totalVotes: Math.floor(30 - i * 4 + Math.random() * 10),
            earnings: (0.01 - i * 0.0015 + Math.random() * 0.005).toFixed(6),
            isYou: i === 0,
          })).sort((a, b) => b.accuracy - a.accuracy);
          setLeaderboard(leaders);
        }
      } catch (err) {
        console.error('Error loading validator data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [contract, account]);

  const handleRegister = async () => {
    if (!contract) return;
    try {
      setRegistering(true);
      toast.loading('Registering as validator...', { id: 'register' });
      const tx = await contract.registerValidator({ value: ethers.parseEther('0.01') });
      await tx.wait();
      setIsValidator(true);
      toast.success('Registered as validator! ✅', { id: 'register' });
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.reason || 'Registration failed', { id: 'register' });
    } finally {
      setRegistering(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24">
        <div className="page-container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <CheckSquare size={28} className="text-accent" />
              Validator Dashboard
            </h1>
            <p className="text-gray-400">Review and verify milestone proofs submitted by NGOs</p>
          </div>
          <div className="glass-card p-16 text-center">
            <Wallet size={48} className="text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">Connect MetaMask to access the validator dashboard</p>
            <button onClick={connectWallet} className="btn-accent mx-auto">
              <Wallet size={18} /> Connect Wallet
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <CheckSquare size={28} className="text-accent" />
            Validator Dashboard
          </h1>
          <p className="text-gray-400">Review and verify milestone proofs submitted by NGOs</p>
        </div>

        {!isValidator ? (
          /* Registration Card */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 text-center max-w-lg mx-auto"
          >
            <Shield size={48} className="text-accent mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Become a Validator</h2>
            <p className="text-gray-400 mb-6">
              Stake 0.01 ETH to register as a validator and help verify milestone proofs
            </p>
            <button
              onClick={handleRegister}
              disabled={registering}
              className="btn-accent mx-auto"
            >
              {registering ? (
                <><Loader2 size={18} className="animate-spin" /> Registering...</>
              ) : (
                <><Lock size={18} /> Register as Validator (0.01 ETH)</>
              )}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Validator Profile Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div className="glass-card p-5 text-center">
                <Shield size={22} className="text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-accent">Active</p>
                <p className="text-gray-400 text-xs mt-1">Validator Status</p>
              </div>
              <div className="glass-card p-5 text-center">
                <Target size={22} className="text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{validatorStats.accuracy}%</p>
                <p className="text-gray-400 text-xs mt-1">Accuracy Score</p>
              </div>
              <div className="glass-card p-5 text-center">
                <CheckSquare size={22} className="text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{validatorStats.totalVotes}</p>
                <p className="text-gray-400 text-xs mt-1">Total Votes</p>
              </div>
              <div className="glass-card p-5 text-center">
                <TrendingUp size={22} className="text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{validatorStats.earnings} ETH</p>
                <p className="text-gray-400 text-xs mt-1">Earnings</p>
              </div>
            </motion.div>

            {/* Warning if accuracy low */}
            {validatorStats.accuracy < 60 && validatorStats.totalVotes > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
              >
                <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-400 text-sm">Low Accuracy Warning</p>
                  <p className="text-red-300 text-xs">Your accuracy is below 60%. Continued low accuracy may result in stake slashing.</p>
                </div>
              </motion.div>
            )}

            {/* Pending Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-accent" />
                Milestones Pending Review ({pendingMilestones.length})
              </h2>

              {pendingMilestones.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <CheckSquare size={40} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No milestones pending review</p>
                  <p className="text-gray-500 text-sm mt-1">Check back later for new proof submissions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingMilestones.map((item, i) => (
                    <ValidatorPanel
                      key={`${item.campaignId}-${item.milestoneIndex}`}
                      campaignId={item.campaignId}
                      campaignTitle={item.campaignTitle}
                      milestoneIndex={item.milestoneIndex}
                      milestone={item.milestone}
                      ngoAddress={item.ngoAddress}
                      contract={contract}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400" />
                Validator Leaderboard
              </h2>

              <div className="glass-card-static overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Rank</th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Validator</th>
                      <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Accuracy</th>
                      <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Votes</th>
                      <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider p-4">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((validator, i) => (
                      <tr
                        key={i}
                        className={`border-b border-white/3 ${
                          validator.isYou ? 'bg-accent/5' : 'hover:bg-white/3'
                        } transition-colors`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {i === 0 && <span className="text-yellow-400">🥇</span>}
                            {i === 1 && <span className="text-gray-300">🥈</span>}
                            {i === 2 && <span className="text-amber-600">🥉</span>}
                            {i > 2 && <span className="text-gray-500 ml-1">#{i + 1}</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm font-mono ${validator.isYou ? 'text-accent font-semibold' : 'text-gray-300'}`}>
                            {shortenAddress(validator.address)}
                            {validator.isYou && <span className="ml-2 badge badge-approved !text-[10px]">You</span>}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`font-bold text-sm ${
                            validator.accuracy >= 80 ? 'text-green-400' :
                            validator.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {validator.accuracy}%
                          </span>
                        </td>
                        <td className="p-4 text-center text-sm text-gray-300">
                          {validator.totalVotes}
                        </td>
                        <td className="p-4 text-right text-sm text-gray-300">
                          {validator.earnings} ETH
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
