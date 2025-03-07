import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Ship, Plane, Package, Users, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 700 },
  { name: 'Jul', value: 900 },
  { name: 'Aug', value: 800 },
  { name: 'Sep', value: 1000 },
  { name: 'Oct', value: 900 },
  { name: 'Nov', value: 700 },
  { name: 'Dec', value: 800 },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Stats Cards */}
        <StatsCard
          title="Total Shipments"
          value="2,547"
          icon={Package}
          change="+12.5%"
          color="blue"
        />
        <StatsCard
          title="Active Routes"
          value="156"
          icon={TrendingUp}
          change="+8.2%"
          color="green"
        />
        <StatsCard
          title="Total Customers"
          value="1,245"
          icon={Users}
          change="+15.3%"
          color="purple"
        />
      </motion.div>

      {/* Transport Mode Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#0D2137] p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold mb-6">Transport Mode Distribution</h2>
        <div className="grid grid-cols-3 gap-4">
          <TransportCard icon={Truck} label="Land" value="45%" />
          <TransportCard icon={Plane} label="Air" value="30%" />
          <TransportCard icon={Ship} label="Sea" value="25%" />
        </div>
      </motion.div>

      {/* Shipment Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#0D2137] p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold mb-6">Shipment Trends</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D2137',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, change, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-[#0D2137] p-6 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`${colors[color]} p-3 rounded-lg`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-green-400">
        <TrendingUp size={16} className="mr-1" />
        <span>{change}</span>
      </div>
    </div>
  );
};

const TransportCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="bg-[#162B44] p-4 rounded-lg flex items-center space-x-4">
      <Icon size={24} className="text-blue-400" />
      <div>
        <p className="text-gray-400">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;