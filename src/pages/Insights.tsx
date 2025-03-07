import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { RouteInsight } from '../types';

const mockInsightData: RouteInsight = {
  feasibility: 85,
  legal: 95,
  cost: 70,
  weather: 60
};

const Insights = () => {
  const [selectedShipment, setSelectedShipment] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  const performanceData = [
    { month: 'Jan', performance: 65 },
    { month: 'Feb', performance: 75 },
    { month: 'Mar', performance: 85 },
    { month: 'Apr', performance: 70 },
    { month: 'May', performance: 90 },
    { month: 'Jun', performance: 95 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Information Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0D2137] p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Shipment ID
              </label>
              <input
                type="text"
                className="w-full bg-[#162B44] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedShipment}
                onChange={(e) => setSelectedShipment(e.target.value)}
                placeholder="Enter shipment ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Destination
              </label>
              <input
                type="text"
                className="w-full bg-[#162B44] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                placeholder="Enter destination"
              />
            </div>
            <button
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
              onClick={() => {/* Handle analysis */}}
            >
              Analyze Route
            </button>
          </div>
        </motion.div>

        {/* Route Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0D2137] p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold mb-6">Route Analysis</h2>
          <div className="space-y-4">
            {Object.entries(mockInsightData).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 capitalize">{key}</span>
                  <span>{value}%</span>
                </div>
                <div className="h-2 bg-[#162B44] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#0D2137] p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold mb-6">Performance Trends</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="month" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D2137',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="performance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Insights;