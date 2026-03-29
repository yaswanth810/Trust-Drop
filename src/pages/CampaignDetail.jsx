import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getCampaignById, getDonationAmount, submitProof } from '../utils/contract';
import { uploadToIPFS } from '../utils/ipfs';
import { formatEth, calculatePercentage, shortenAddress, getEtherscanAddressUrl } from '../utils/helpers';
import MilestoneTracker from '../components/MilestoneTracker';
import DonateModal from '../components/DonateModal';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { 
  Heart, Shield, ExternalLink, Users, Target, Upload, 
  Loader2, ArrowLeft, Copy, CheckCircle2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CampaignDetail() {
  const { id } = useParams();
  const { contract, account, isConnected } = useWeb3();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);
  const [userDonation, setUserDonation] = useState(BigInt(0));
  const [uploading, setUploading] = useState(false);
  const [proofMilestoneIndex, setProofMilestoneIndex] = useState(null);

  const fetchCampaign = useCallback(async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const data = await getCampaignById(contract, parseInt(id));
      setCampaign(data);

      if (account) {
        const donation = await getDonationAmount(contract, parseInt(id), account);
        setUserDonation(donation);
      }
    } catch (err) {
      console.error('Error fetching campaign:', err);
    } finally {
      setLoading(false);
    }
  }, [contract, id, account]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handleSubmitProof = async (milestoneIndex) => {
    setProofMilestoneIndex(milestoneIndex);
    // Create file input for proof upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setUploading(true);
        toast.loading('Uploading proof to IPFS...', { id: 'proof-upload' });

        const ipfsHash = await uploadToIPFS(file);
        toast.success('Uploaded to IPFS!', { id: 'proof-upload' });

        toast.loading('Submitting proof on-chain...', { id: 'proof-submit' });
        const tx = await submitProof(contract, parseInt(id), milestoneIndex, ipfsHash);
        await tx.wait();
        toast.success('Proof submitted on-chain! ✓', { id: 'proof-submit' });

        fetchCampaign();
      } catch (err) {
        console.error('Proof submission error:', err);
        toast.error(err.message || 'Failed to submit proof', { id: 'proof-upload' });
        toast.dismiss('proof-submit');
      } finally {
        setUploading(false);
        setProofMilestoneIndex(null);
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 size={40} className="text-accent animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Campaign Not Found</h2>
          <p className="text-gray-400 mb-6">Connect your wallet or check the campaign ID</p>
          <Link to="/" className="btn-accent">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const percentage = calculatePercentage(campaign.raisedFunds, campaign.totalFunds);
  const isNGO = account && campaign.ngoAddress.toLowerCase() === account.toLowerCase();

  return (
    <div className="min-h-screen pt-24">
      <div className="page-container">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-accent mb-6 text-sm transition-colors">
          <ArrowLeft size={16} />
          Back to Campaigns
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {campaign.title}
                  </h1>
                  <a
                    href={getEtherscanAddressUrl(campaign.ngoAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-400 text-sm hover:text-accent transition-colors"
                  >
                    <Shield size={14} />
                    NGO: {shortenAddress(campaign.ngoAddress)}
                    <ExternalLink size={12} />
                  </a>
                </div>
                {isNGO && (
                  <span className="badge badge-approved">Your Campaign</span>
                )}
              </div>

              <p className="text-gray-300 leading-relaxed mb-6">
                {campaign.description}
              </p>

              {/* Fund Progress */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">
                    <span className="text-2xl font-bold text-white">{formatEth(campaign.raisedFunds)}</span> ETH raised
                  </span>
                  <span className="text-accent font-semibold text-lg">{percentage}%</span>
                </div>
                <div className="progress-bar h-3 rounded-lg">
                  <div className="progress-bar-fill h-full rounded-lg" style={{ width: `${percentage}%` }} />
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  Target: {formatEth(campaign.totalFunds)} ETH • {campaign.milestoneCount} milestones
                </p>
              </div>
            </motion.div>

            {/* Milestone Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MilestoneTracker
                milestones={campaign.milestones || []}
                campaignId={campaign.campaignId}
                isNGO={isNGO}
                onSubmitProof={handleSubmitProof}
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donate Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6 sticky top-24"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Heart size={18} className="text-accent" />
                Support This Campaign
              </h3>

              <button
                onClick={() => setDonateOpen(true)}
                className="w-full btn-accent justify-center text-base !py-4 mb-4"
              >
                <Heart size={18} />
                Donate ETH
              </button>

              <p className="text-gray-400 text-xs text-center leading-relaxed">
                Your contribution is locked in a smart contract and released only when milestones are verified by validators.
              </p>

              {/* User Donation Info */}
              {userDonation > BigInt(0) && (
                <div className="mt-4 p-3 rounded-xl bg-accent/5 border border-accent/10">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={14} className="text-accent" />
                    <span className="text-accent text-sm font-medium">Your Contribution</span>
                  </div>
                  <p className="text-white font-bold">{formatEth(userDonation)} ETH</p>
                  <p className="text-gray-400 text-xs mt-1">Locked until milestones complete</p>
                </div>
              )}

              {/* Campaign Stats */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Target size={14} />
                    Milestones
                  </span>
                  <span className="text-white font-medium">{campaign.milestoneCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Shield size={14} />
                    Status
                  </span>
                  <span className={`text-sm font-medium ${campaign.isActive ? 'text-accent' : 'text-red-400'}`}>
                    {campaign.isFrozen ? 'Frozen' : campaign.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Donate Modal */}
      <DonateModal
        campaign={campaign}
        isOpen={donateOpen}
        onClose={() => setDonateOpen(false)}
        onSuccess={fetchCampaign}
      />

      <Footer />
    </div>
  );
}
