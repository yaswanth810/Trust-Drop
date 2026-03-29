import { motion, AnimatePresence } from 'framer-motion';
import { getMilestoneStatus, formatEth, formatDate } from '../utils/helpers';
import { getIPFSUrl } from '../utils/ipfs';
import { 
  CheckCircle2, Clock, Upload, Eye, ChevronRight, 
  ExternalLink, AlertCircle, Lock 
} from 'lucide-react';

function StatusIcon({ milestone }) {
  if (milestone.fundsReleased) return <CheckCircle2 size={20} className="text-green-400" />;
  if (milestone.isApproved) return <CheckCircle2 size={20} className="text-accent" />;
  if (milestone.ipfsHash) return <Upload size={20} className="text-blue-400" />;
  return <Clock size={20} className="text-yellow-400" />;
}

export default function MilestoneTracker({ milestones, campaignId, isNGO, onSubmitProof }) {
  return (
    <div className="space-y-0">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Lock size={18} className="text-accent" />
        Milestone Tracker
      </h3>

      {milestones.map((milestone, index) => {
        const status = getMilestoneStatus(milestone);
        const isLast = index === milestones.length - 1;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15, duration: 0.4 }}
            className="flex gap-4"
          >
            {/* Stepper */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                milestone.fundsReleased
                  ? 'border-green-400 bg-green-400/10'
                  : milestone.isApproved
                  ? 'border-accent bg-accent/10'
                  : milestone.ipfsHash
                  ? 'border-blue-400 bg-blue-400/10'
                  : 'border-gray-600 bg-gray-600/10'
              }`}>
                <StatusIcon milestone={milestone} />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[40px] ${
                  milestone.fundsReleased || milestone.isApproved
                    ? 'bg-gradient-to-b from-accent to-accent/20'
                    : 'bg-gray-700'
                }`} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
              <div className="glass-card p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-white font-semibold text-sm">
                      Milestone {index + 1}
                    </h4>
                    <p className="text-gray-300 text-sm mt-1">
                      {milestone.description}
                    </p>
                  </div>
                  <span className={`badge ${status.className} whitespace-nowrap`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Lock size={12} />
                    {formatEth(milestone.fundAmount)} ETH
                  </span>
                  {milestone.deadline > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Due: {formatDate(milestone.deadline)}
                    </span>
                  )}
                </div>

                {/* IPFS Proof Link */}
                {milestone.ipfsHash && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 mb-3">
                    <Eye size={14} className="text-accent" />
                    <a
                      href={getIPFSUrl(milestone.ipfsHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent text-sm hover:underline flex items-center gap-1"
                    >
                      View Proof on IPFS
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                {/* Approval Progress */}
                {milestone.ipfsHash && !milestone.fundsReleased && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${(milestone.approvalCount / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 whitespace-nowrap">
                      {milestone.approvalCount}/3 approved
                    </span>
                  </div>
                )}

                {/* NGO Submit Proof Button */}
                {isNGO && !milestone.ipfsHash && !milestone.isApproved && (
                  <button
                    onClick={() => onSubmitProof && onSubmitProof(index)}
                    className="mt-3 btn-accent text-xs !py-2 !px-4"
                  >
                    <Upload size={14} />
                    Submit Proof
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
