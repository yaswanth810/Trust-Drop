import { motion } from 'framer-motion';
import { useWeb3 } from '../context/Web3Context';
import { ArrowRight, Shield, Globe, Lock } from 'lucide-react';

export default function HeroSection() {
  const { connectWallet, isConnected } = useWeb3();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 page-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Trust Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8"
          >
            <Shield size={16} className="text-accent" />
            <span className="text-accent text-sm font-medium">Blockchain-Verified Transparency</span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">Every Rupee.</span>
            <br />
            <span className="text-white">Tracked. Trusted.</span>
            <br />
            <span className="gradient-text">Transparent.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Blockchain-powered NGO fund transparency platform. Donate with confidence, 
            knowing every milestone is verified by independent validators before funds are released.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isConnected ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={connectWallet}
                className="btn-accent text-base !py-4 !px-8 animate-pulse-glow"
              >
                Connect Wallet
                <ArrowRight size={18} />
              </motion.button>
            ) : (
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#campaigns"
                className="btn-accent text-base !py-4 !px-8"
              >
                Browse Campaigns
                <ArrowRight size={18} />
              </motion.a>
            )}
            <a href="#how-it-works" className="btn-secondary text-base !py-4 !px-8">
              How It Works
            </a>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto"
        >
          {[
            {
              icon: Lock,
              title: 'Funds Locked',
              desc: 'Donations are held in smart contracts until milestones are verified',
            },
            {
              icon: Shield,
              title: 'Validator Verified',
              desc: '3/5 independent validators must approve before any funds release',
            },
            {
              icon: Globe,
              title: 'Fully Transparent',
              desc: 'Every transaction is recorded on-chain and publicly verifiable',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
              className="glass-card p-6 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <feature.icon size={20} className="text-accent" />
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
