import { approveMilestone } from '../utils/contract';
import { getIPFSUrl } from '../utils/ipfs';
import { getMilestoneStatus, formatEth, formatDate, shortenAddress } from '../utils/helpers';
import { CheckCircle, ExternalLink, Eye, Loader2, FileCheck, Users } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * ValidatorPanel supports two usage modes:
 * 1. Full campaign mode: pass `campaign` prop with full campaign obj
 * 2. Single milestone mode: pass `campaignId`, `campaignTitle`, `milestoneIndex`, `milestone`, `ngoAddress` individually
 */
export default function ValidatorPanel({
  campaign,
  contract,
  onUpdate,
  // Individual props (used by ValidatorDashboard)
  campaignId,
  campaignTitle,
  milestoneIndex,
  milestone: singleMilestone,
  ngoAddress,
}) {
  const [loadingIndex, setLoadingIndex] = useState(null);

  // Determine mode
  const isSingleMode = !campaign && singleMilestone;

  const handleApprove = async (cId, mIndex) => {
    try {
      setLoadingIndex(mIndex);
      const tx = await approveMilestone(contract, cId, mIndex);
      toast.loading('Approving milestone...', { id: `approve-${mIndex}` });
      await tx.wait();
      toast.success('Milestone approved! ✓', { id: `approve-${mIndex}` });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Approval error:', err);
      toast.error(err.reason || 'Approval failed', { id: `approve-${mIndex}` });
    } finally {
      setLoadingIndex(null);
    }
  };

  // Single milestone mode (from ValidatorDashboard)
  if (isSingleMode) {
    const status = getMilestoneStatus(singleMilestone);
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5"
      >
        {/* Campaign info header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <Link
              to={`/campaign/${campaignId}`}
              className="text-white font-semibold hover:text-accent transition-colors"
            >
              {campaignTitle || `Campaign #${campaignId}`}
            </Link>
            {ngoAddress && (
              <Link
                to={`/ngo/${ngoAddress}`}
                className="flex items-center gap-1 text-gray-400 text-xs mt-1 hover:text-accent transition-colors"
              >
                <Users size={12} />
                {shortenAddress(ngoAddress)}
              </Link>
            )}
          </div>
          <span className={`badge ${status.className}`}>{status.label}</span>
        </div>

        {/* Milestone info */}
        <div className="p-3 rounded-lg bg-white/3 mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <FileCheck size={14} className="text-accent" />
            Milestone {(milestoneIndex || 0) + 1}: {singleMilestone.description}
          </h4>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{formatEth(singleMilestone.fundAmount)} ETH</span>
            <span>Due: {formatDate(singleMilestone.deadline)}</span>
          </div>
        </div>

        {/* IPFS Proof */}
        {singleMilestone.ipfsHash && (
          <a
            href={getIPFSUrl(singleMilestone.ipfsHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 mb-4 text-accent text-sm hover:bg-white/10 transition-colors"
          >
            <Eye size={14} />
            View Submitted Proof
            <ExternalLink size={12} />
          </a>
        )}

        {/* Approval Progress */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${((singleMilestone.approvalCount || 0) / 3) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-400">
            {singleMilestone.approvalCount || 0}/3 votes
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleApprove(campaignId, milestoneIndex)}
          disabled={loadingIndex === milestoneIndex}
          className="w-full btn-accent justify-center text-sm !py-2.5"
        >
          {loadingIndex === milestoneIndex ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CheckCircle size={16} />
          )}
          Approve Milestone
        </button>
      </motion.div>
    );
  }

  // Full campaign mode (legacy)
  if (!campaign) return null;

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
      {pendingMilestones.map((ms, i) => {
        const status = getMilestoneStatus(ms);
        return (
          <motion.div
            key={ms.index || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="text-white font-semibold text-sm">
                  Milestone {(ms.index || i) + 1}: {ms.description}
                </h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{formatEth(ms.fundAmount)} ETH</span>
                  <span>Due: {formatDate(ms.deadline)}</span>
                </div>
              </div>
              <span className={`badge ${status.className}`}>{status.label}</span>
            </div>

            {/* IPFS Proof */}
            <a
              href={getIPFSUrl(ms.ipfsHash)}
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
                  style={{ width: `${((ms.approvalCount || 0) / 3) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-400">
                {ms.approvalCount || 0}/3 votes
              </span>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => handleApprove(campaign.campaignId, ms.index || i)}
              disabled={loadingIndex === (ms.index || i)}
              className="w-full btn-accent justify-center text-sm !py-2.5"
            >
              {loadingIndex === (ms.index || i) ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              Approve Milestone
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
