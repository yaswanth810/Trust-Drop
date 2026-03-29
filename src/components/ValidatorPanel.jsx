import { approveMilestone } from '../utils/contract';
import { getIPFSUrl } from '../utils/ipfs';
import { getMilestoneStatus, formatEth, formatDate } from '../utils/helpers';
import { CheckCircle, XCircle, ExternalLink, Eye, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ValidatorPanel({ campaign, contract, onUpdate }) {
  const [loadingIndex, setLoadingIndex] = useState(null);

  const handleApprove = async (milestoneIndex) => {
    try {
      setLoadingIndex(milestoneIndex);
      const tx = await approveMilestone(contract, campaign.campaignId, milestoneIndex);
      toast.loading('Approving milestone...', { id: `approve-${milestoneIndex}` });
      await tx.wait();
      toast.success('Milestone approved! ✓', { id: `approve-${milestoneIndex}` });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Approval error:', err);
      toast.error(err.reason || 'Approval failed', { id: `approve-${milestoneIndex}` });
    } finally {
      setLoadingIndex(null);
    }
  };

  const pendingMilestones = campaign.milestones
    ? campaign.milestones.filter((m) => m.ipfsHash && !m.isApproved && !m.fundsReleased)
    : [];

  if (pendingMilestones.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-gray-400">No pending milestones to review for this campaign.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingMilestones.map((milestone, i) => {
        const status = getMilestoneStatus(milestone);
        return (
          <motion.div
            key={milestone.index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="text-white font-semibold text-sm">
                  Milestone {milestone.index + 1}: {milestone.description}
                </h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{formatEth(milestone.fundAmount)} ETH</span>
                  <span>Due: {formatDate(milestone.deadline)}</span>
                </div>
              </div>
              <span className={`badge ${status.className}`}>{status.label}</span>
            </div>

            {/* IPFS Proof */}
            <a
              href={getIPFSUrl(milestone.ipfsHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 mb-4 text-accent text-sm hover:bg-white/10 transition-colors"
            >
              <Eye size={14} />
              View Submitted Proof
              <ExternalLink size={12} />
            </a>

            {/* Approval Progress */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${(milestone.approvalCount / 3) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-400">
                {milestone.approvalCount}/3 votes
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(milestone.index)}
                disabled={loadingIndex === milestone.index}
                className="flex-1 btn-accent justify-center text-sm !py-2.5"
              >
                {loadingIndex === milestone.index ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Approve
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
