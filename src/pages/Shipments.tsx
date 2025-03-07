import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ArrowUpDown } from 'lucide-react';
import type { Shipment } from '../types';

const mockShipments: Shipment[] = [
  {
    id: '1',
    customerName: 'Jane Cooper',
    company: 'Microsoft',
    phoneNumber: '(225) 555-0118',
    email: 'jane@microsoft.com',
    country: 'United States',
    status: 'active'
  },
  {
    id: '2',
    customerName: 'Floyd Miles',
    company: 'Yahoo',
    phoneNumber: '(205) 555-0100',
    email: 'floyd@yahoo.com',
    country: 'Kiribati',
    status: 'inactive'
  },
  {
    id: '3',
    customerName: 'Ronald Richards',
    company: 'Adobe',
    phoneNumber: '(302) 555-0107',
    email: 'ronald@adobe.com',
    country: 'Israel',
    status: 'inactive'
  },
  {
    id: '4',
    customerName: 'Marvin McKinney',
    company: 'Tesla',
    phoneNumber: '(252) 555-0126',
    email: 'marvin@tesla.com',
    country: 'Iran',
    status: 'active'
  },
  {
    id: '5',
    customerName: 'Jerome Bell',
    company: 'Google',
    phoneNumber: '(629) 555-0129',
    email: 'jerome@google.com',
    country: 'Réunion',
    status: 'active'
  }
];

const Shipments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const filteredShipments = mockShipments.filter(
    (shipment) =>
      shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0D2137] rounded-xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">All Shipments</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-[#162B44] pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  className="bg-[#162B44] pl-4 pr-10 py-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Phone Number</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((shipment) => (
                  <motion.tr
                    key={shipment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-[#1E3A5F]"
                  >
                    <td className="px-4 py-4">{shipment.customerName}</td>
                    <td className="px-4 py-4">{shipment.company}</td>
                    <td className="px-4 py-4">{shipment.phoneNumber}</td>
                    <td className="px-4 py-4">{shipment.email}</td>
                    <td className="px-4 py-4">{shipment.country}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          shipment.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {shipment.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Shipments;