import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getAllCampaigns, checkIsValidator, registerAsValidator } from '../utils/contract';
import ValidatorPanel from '../components/ValidatorPanel';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Shield, CheckSquare, Loader2, Wallet, AlertCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ValidatorDashboard() {
  const { contract, account, isConnected, connectWallet } = useWeb3();
  const [isValidator, setIsValidator] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!contract || !account) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [validatorStatus, allCampaigns] = await Promise.all([
          checkIsValidator(contract, account),
          getAllCampaigns(contract),
        ]);
        setIsValidator(validatorStatus);

        // Filter campaigns with pending milestone proofs
        const withPendingProofs = allCampaigns.filter((c) =>
          c && c.milestones && c.milestones.some((m) => m.ipfsHash && !m.isApproved && !m.fundsReleased)
        );
        setCampaigns(withPendingProofs);
      } catch (err) {
        console.error('Error fetching validator data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [contract, account]);

  const handleRegister = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    try {
      setRegistering(true);
      toast.loading('Registering as validator (0.01 ETH stake)...', { id: 'register' });
      const tx = await registerAsValidator(contract);
      toast.loading('Transaction pending...', { id: 'register' });
      await tx.wait();
      toast.success('You are now a registered validator! ✓', { id: 'register' });
      setIsValidator(true);
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.reason || 'Registration failed', { id: 'register' });
    } finally {
      setRegistering(false);
    }
  };

  const handleUpdate = async () => {
    if (!contract) return;
    const allCampaigns = await getAllCampaigns(contract);
    const withPendingProofs = allCampaigns.filter((c) =>
      c && c.milestones && c.milestones.some((m) => m.ipfsHash && !m.isApproved && !m.fundsReleased)
    );
    setCampaigns(withPendingProofs);
  };

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
              <CheckSquare size={28} className="text-accent" />
              Validator Dashboard
            </h1>
            <p className="text-gray-400">
              Review and verify milestone proofs submitted by NGOs
            </p>
          </div>

          {!isConnected ? (
            <div className="glass-card p-12 text-center">
              <Wallet size={48} className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-6">Connect MetaMask to access the validator dashboard</p>
              <button onClick={connectWallet} className="btn-accent">
                <Wallet size={18} />
                Connect Wallet
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="text-accent animate-spin" />
            </div>
          ) : !isValidator ? (
            /* Registration Panel */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center max-w-lg mx-auto"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield size={32} className="text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Become a Validator</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Validators play a crucial role in ensuring fund transparency. 
                Review milestone proofs and approve fund releases.
              </p>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-6 text-left">
                <h4 className="text-white font-medium mb-3">Requirements</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Lock size={14} className="text-accent" />
                    Stake 0.01 ETH as a security deposit
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckSquare size={14} className="text-accent" />
                    Review submitted milestone proofs
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield size={14} className="text-accent" />
                    Vote to approve or flag milestones
                  </li>
                </ul>
              </div>

              <button
                onClick={handleRegister}
                disabled={registering}
                className="btn-accent w-full justify-center !py-4"
              >
                {registering ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    Register as Validator (0.01 ETH)
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            /* Validator Review Panel */
            <div className="space-y-6">
              {/* Status */}
              <div className="glass-card p-4 flex items-center gap-3">
                <span className="status-dot connected" />
                <span className="text-accent font-medium text-sm">Registered Validator</span>
              </div>

              {campaigns.length > 0 ? (
                <div className="space-y-8">
                  {campaigns.map((campaign) => (
                    <div key={campaign.campaignId}>
                      <h3 className="text-lg font-bold text-white mb-4">
                        {campaign.title}
                        <span className="text-gray-400 text-sm font-normal ml-2">
                          (Campaign #{campaign.campaignId})
                        </span>
                      </h3>
                      <ValidatorPanel
                        campaign={campaign}
                        contract={contract}
                        onUpdate={handleUpdate}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <AlertCircle size={48} className="text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Pending Reviews</h3>
                  <p className="text-gray-400">
                    There are no milestone proofs waiting for validation at this time.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
