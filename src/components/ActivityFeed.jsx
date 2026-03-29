import { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { motion, AnimatePresence } from 'framer-motion';
import { shortenAddress, timeAgo, formatEth } from '../utils/helpers';
import { 
  Heart, FileCheck, CheckCircle2, Banknote, 
  RotateCcw, Activity, ExternalLink 
} from 'lucide-react';

const EVENT_CONFIG = {
  DonationReceived: {
    icon: Heart,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    emoji: '🎉',
    format: (args) => `${shortenAddress(args.donor)} donated ${formatEth(args.amount)} ETH`,
  },
  ProofSubmitted: {
    icon: FileCheck,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    emoji: '📁',
    format: (args) => `Proof submitted for Campaign #${args.campaignId?.toString()}`,
  },
  MilestoneApproved: {
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    emoji: '✅',
    format: (args) => `Milestone approved for Campaign #${args.campaignId?.toString()}`,
  },
  FundsReleased: {
    icon: Banknote,
    color: 'text-accent',
    bg: 'bg-accent/10',
    emoji: '💸',
    format: (args) => `${formatEth(args.amount)} ETH released to NGO`,
  },
  CampaignCreated: {
    icon: Activity,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    emoji: '🆕',
    format: (args) => `New campaign created: #${args.campaignId?.toString()}`,
  },
};

export default function ActivityFeed() {
  const { contract } = useWeb3();
  const [events, setEvents] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const eventsRef = useRef([]);

  useEffect(() => {
    if (!contract) return;

    const addEvent = (type, args, event) => {
      const newEvent = {
        id: `${type}-${Date.now()}-${Math.random()}`,
        type,
        args: { ...args },
        timestamp: Math.floor(Date.now() / 1000),
        txHash: event?.log?.transactionHash || event?.transactionHash || '',
      };
      eventsRef.current = [newEvent, ...eventsRef.current].slice(0, 20);
      setEvents([...eventsRef.current]);
    };

    // Load past events (last 1000 blocks)
    async function loadPastEvents() {
      try {
        const provider = contract.runner?.provider;
        if (!provider) return;
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 1000);

        const eventNames = Object.keys(EVENT_CONFIG);
        for (const eventName of eventNames) {
          try {
            const filter = contract.filters[eventName]?.();
            if (!filter) continue;
            const logs = await contract.queryFilter(filter, fromBlock, currentBlock);
            logs.forEach((log) => {
              const parsed = {
                id: `${eventName}-${log.transactionHash}-${log.index}`,
                type: eventName,
                args: log.args ? Object.fromEntries(
                  Object.entries(log.args).filter(([k]) => isNaN(k))
                ) : {},
                timestamp: Math.floor(Date.now() / 1000),
                txHash: log.transactionHash,
              };
              eventsRef.current.push(parsed);
            });
          } catch (e) {
            // Event may not exist in contract
          }
        }
        eventsRef.current = eventsRef.current
          .slice(0, 20)
          .sort((a, b) => b.timestamp - a.timestamp);
        setEvents([...eventsRef.current]);
      } catch (err) {
        console.error('Error loading past events:', err);
      }
    }

    loadPastEvents();

    // Listen for live events
    const listeners = [];
    Object.keys(EVENT_CONFIG).forEach((eventName) => {
      try {
        const handler = (...allArgs) => {
          const event = allArgs[allArgs.length - 1];
          const argNames = allArgs.slice(0, -1);
          const args = {};
          argNames.forEach((val, i) => {
            args[`arg${i}`] = val;
          });
          // Try to parse named args from event
          if (event?.args) {
            Object.entries(event.args).forEach(([k, v]) => {
              if (isNaN(k)) args[k] = v;
            });
          }
          addEvent(eventName, args, event);
        };
        contract.on(eventName, handler);
        listeners.push({ eventName, handler });
        setIsLive(true);
      } catch (e) {
        // Event may not exist
      }
    });

    return () => {
      listeners.forEach(({ eventName, handler }) => {
        try { contract.off(eventName, handler); } catch (e) {}
      });
    };
  }, [contract]);

  return (
    <div className="sticky top-20">
      <div className="glass-card-static overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-accent" />
            <span className="font-semibold text-sm">Live Activity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`status-dot ${isLive ? 'live' : 'disconnected'}`} />
            <span className="text-xs text-gray-400">{isLive ? 'Live' : 'Offline'}</span>
          </div>
        </div>

        {/* Events */}
        <div className="max-h-[500px] overflow-y-auto">
          {events.length === 0 ? (
            <div className="p-8 text-center">
              <Activity size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No activity yet</p>
              <p className="text-gray-600 text-xs mt-1">Events will appear here in real-time</p>
            </div>
          ) : (
            <AnimatePresence>
              {events.map((event) => {
                const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.CampaignCreated;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-3 border-b border-white/3 hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={14} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-relaxed">
                          <span className="mr-1">{config.emoji}</span>
                          {config.format(event.args)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{timeAgo(event.timestamp)}</span>
                          {event.txHash && (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${event.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline"
                            >
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
