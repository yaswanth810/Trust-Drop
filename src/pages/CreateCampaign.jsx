import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { createNewCampaign } from '../utils/contract';
import { formatEth } from '../utils/helpers';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, Loader2, ArrowLeft, Target, Wallet } from 'lucide-react';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

export default function CreateCampaign() {
  const { contract, isConnected, connectWallet } = useWeb3();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState([
    { description: '', amount: '', deadline: '' },
  ]);
  const [loading, setLoading] = useState(false);

  const addMilestone = () => {
    setMilestones([...milestones, { description: '', amount: '', deadline: '' }]);
  };

  const removeMilestone = (index) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const totalAmount = milestones.reduce((sum, m) => {
    const amount = parseFloat(m.amount) || 0;
    return sum + amount;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      connectWallet();
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a campaign title');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a campaign description');
      return;
    }

    const invalidMilestone = milestones.find(
      (m) => !m.description.trim() || !m.amount || parseFloat(m.amount) <= 0 || !m.deadline
    );
    if (invalidMilestone) {
      toast.error('Please fill in all milestone fields');
      return;
    }

    try {
      setLoading(true);
      const descs = milestones.map((m) => m.description);
      const amounts = milestones.map((m) => m.amount);
      const deadlines = milestones.map((m) => m.deadline);

      toast.loading('Creating campaign on-chain...', { id: 'create-campaign' });
      const tx = await createNewCampaign(contract, title, description, descs, amounts, deadlines);
      toast.loading('Transaction pending...', { id: 'create-campaign' });
      await tx.wait();
      toast.success('Campaign created successfully! ✓', { id: 'create-campaign' });

      navigate('/');
    } catch (err) {
      console.error('Create campaign error:', err);
      toast.error(err.reason || 'Failed to create campaign', { id: 'create-campaign' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="page-container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-accent mb-4 text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">Create New Campaign</h1>
            <p className="text-gray-400">Define your campaign milestones and fund allocation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Details */}
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Campaign Details</h2>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Campaign Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Vizag Flood Relief 2025"
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your campaign goals, beneficiaries, and how funds will be used..."
                  className="input-field"
                  rows={4}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Milestones */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target size={18} className="text-accent" />
                  Milestones
                </h2>
                <div className="text-sm">
                  <span className="text-gray-400">Total: </span>
                  <span className="text-accent font-bold">{totalAmount.toFixed(4)} ETH</span>
                </div>
              </div>

              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-accent">
                        Milestone {index + 1}
                      </span>
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      placeholder="Milestone description"
                      className="input-field text-sm"
                      disabled={loading}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Amount (ETH)</label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={milestone.amount}
                          onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                          placeholder="0.05"
                          className="input-field text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Deadline</label>
                        <input
                          type="date"
                          value={milestone.deadline}
                          onChange={(e) => updateMilestone(index, 'deadline', e.target.value)}
                          className="input-field text-sm"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                type="button"
                onClick={addMilestone}
                disabled={loading}
                className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-white/10 text-gray-400 text-sm font-medium hover:border-accent/30 hover:text-accent transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle size={16} />
                Add Milestone
              </button>
            </div>

            {/* Summary */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Milestones</span>
                  <span className="text-white">{milestones.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Goal</span>
                  <span className="text-accent font-bold">{totalAmount.toFixed(4)} ETH</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent justify-center text-base !py-4"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Deploying Campaign...
                </>
              ) : !isConnected ? (
                <>
                  <Wallet size={20} />
                  Connect Wallet to Create
                </>
              ) : (
                <>
                  <PlusCircle size={20} />
                  Deploy Campaign ({totalAmount.toFixed(4)} ETH goal)
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
