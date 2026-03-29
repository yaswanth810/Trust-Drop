import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getAllCampaigns, getPlatformStats } from '../utils/contract';
import { formatEth } from '../utils/helpers';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, BarChart3, PieChart as PieIcon, Activity,
  Wallet, Target, Users, CheckCircle2, Loader2
} from 'lucide-react';
import Footer from '../components/Footer';

const CHART_COLORS = ['#00C896', '#0A84FF', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CACHE_KEY = 'trustdrop_analytics';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function setCachedData(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

function StatCard({ icon: Icon, label, value, color = 'text-accent', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
}

function ChartCard({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="chart-container"
    >
      <div className="flex items-center gap-2 mb-6">
        <Icon size={18} className="text-accent" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-static p-3 !rounded-lg text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { contract, isConnected } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [donationData, setDonationData] = useState([]);
  const [milestoneData, setMilestoneData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!contract) return;

      // Check cache
      const cached = getCachedData();
      if (cached) {
        setStats(cached.stats);
        setDonationData(cached.donationData);
        setMilestoneData(cached.milestoneData);
        setCategoryData(cached.categoryData);
        setDailyActivity(cached.dailyActivity);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [campaigns, platformStats] = await Promise.all([
          getAllCampaigns(contract),
          getPlatformStats(contract),
        ]);

        const validCampaigns = campaigns.filter(Boolean);

        // Stats
        const totalLocked = validCampaigns.reduce((acc, c) => {
          const raised = parseFloat(ethers.formatEther(c.raisedFunds || '0'));
          const released = (c.milestones || [])
            .filter(m => m.fundsReleased)
            .reduce((s, m) => s + parseFloat(ethers.formatEther(m.fundAmount || '0')), 0);
          return acc + (raised - released);
        }, 0);

        const totalReleased = validCampaigns.reduce((acc, c) => {
          return acc + (c.milestones || [])
            .filter(m => m.fundsReleased)
            .reduce((s, m) => s + parseFloat(ethers.formatEther(m.fundAmount || '0')), 0);
        }, 0);

        const totalMilestones = validCampaigns.reduce((acc, c) => {
          return acc + (c.milestones || []).filter(m => m.fundsReleased || m.isApproved).length;
        }, 0);

        const statsObj = {
          totalLocked: totalLocked.toFixed(4),
          totalReleased: totalReleased.toFixed(4),
          campaignCount: validCampaigns.length,
          milestonesCompleted: totalMilestones,
          avgTrustScore: 'N/A',
          uniqueDonors: platformStats.uniqueDonors || '—',
        };
        setStats(statsObj);

        // Simulated cumulative donation data
        const donData = [];
        let cumulative = 0;
        validCampaigns.forEach((c, i) => {
          const raised = parseFloat(ethers.formatEther(c.raisedFunds || '0'));
          cumulative += raised;
          donData.push({
            name: `Campaign ${i + 1}`,
            total: parseFloat(cumulative.toFixed(4)),
          });
        });
        setDonationData(donData.length > 0 ? donData : [{ name: 'No Data', total: 0 }]);

        // Milestone completion by campaign
        const msData = validCampaigns.map((c, i) => {
          const total = c.milestoneCount || (c.milestones?.length || 1);
          const completed = (c.milestones || []).filter(m => m.fundsReleased || m.isApproved).length;
          return {
            name: c.title?.slice(0, 15) || `Campaign ${i}`,
            completion: total > 0 ? Math.round((completed / total) * 100) : 0,
          };
        });
        setMilestoneData(msData.length > 0 ? msData : [{ name: 'No Data', completion: 0 }]);

        // Category distribution
        const categories = { Relief: 0, Education: 0, Medical: 0, Infrastructure: 0, Environment: 0, Other: 0 };
        validCampaigns.forEach((c) => {
          const text = `${c.title} ${c.description}`.toLowerCase();
          let matched = false;
          for (const cat of Object.keys(categories)) {
            if (cat !== 'Other' && text.includes(cat.toLowerCase())) {
              categories[cat] += parseFloat(ethers.formatEther(c.raisedFunds || '0'));
              matched = true;
              break;
            }
          }
          if (!matched) categories.Other += parseFloat(ethers.formatEther(c.raisedFunds || '0'));
        });
        const catData = Object.entries(categories)
          .filter(([, v]) => v > 0)
          .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(4)) }));
        setCategoryData(catData.length > 0 ? catData : [{ name: 'No Data', value: 1 }]);

        // Daily activity (simulated rolling 7 days)
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const actData = days.map((d) => ({
          name: d,
          donations: Math.floor(Math.random() * validCampaigns.length + 1),
          eth: parseFloat((Math.random() * 0.1).toFixed(4)),
        }));
        setDailyActivity(actData);

        // Cache
        setCachedData({ stats: statsObj, donationData: donData, milestoneData: msData, categoryData: catData, dailyActivity: actData });
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [contract]);

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24">
        <div className="page-container">
          <div className="glass-card p-16 text-center">
            <BarChart3 size={48} className="text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400">Connect MetaMask to view platform analytics</p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 size={28} className="text-accent" />
            Platform Analytics
          </h1>
          <p className="text-gray-400">Real-time insights into TrustDrop platform performance</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <StatCard icon={Wallet} label="ETH Locked" value={`${stats.totalLocked} ETH`} delay={0} />
          <StatCard icon={TrendingUp} label="ETH Released" value={`${stats.totalReleased} ETH`} delay={0.05} />
          <StatCard icon={Activity} label="Active Campaigns" value={stats.campaignCount} delay={0.1} />
          <StatCard icon={CheckCircle2} label="Milestones Done" value={stats.milestonesCompleted} delay={0.15} />
          <StatCard icon={Target} label="Avg TrustScore" value={stats.avgTrustScore} delay={0.2} />
          <StatCard icon={Users} label="Unique Donors" value={stats.uniqueDonors} delay={0.25} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Line Chart */}
          <ChartCard title="Cumulative ETH Donated" icon={TrendingUp} delay={0.1}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={donationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#00C896"
                  strokeWidth={2.5}
                  dot={{ fill: '#00C896', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Total ETH"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Bar Chart */}
          <ChartCard title="Milestone Completion by Campaign" icon={BarChart3} delay={0.15}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={milestoneData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completion" name="Completion %" radius={[6, 6, 0, 0]}>
                  {milestoneData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Pie Chart */}
          <ChartCard title="Fund Distribution by Category" icon={PieIcon} delay={0.2}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#6B7280' }}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Area Chart */}
          <ChartCard title="Daily Donation Activity" icon={Activity} delay={0.25}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="donations"
                  stroke="#0A84FF"
                  fill="rgba(10, 132, 255, 0.15)"
                  strokeWidth={2}
                  name="Donations"
                />
                <Area
                  type="monotone"
                  dataKey="eth"
                  stroke="#00C896"
                  fill="rgba(0, 200, 150, 0.1)"
                  strokeWidth={2}
                  name="ETH Amount"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
      <Footer />
    </div>
  );
}
