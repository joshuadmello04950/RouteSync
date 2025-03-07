import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Plane, Package, BarChart2, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/' },
    { icon: Plane, label: 'Routes', path: '/routes' },
    { icon: Package, label: 'Shipments', path: '/shipments' },
    { icon: BarChart2, label: 'Insights', path: '/insights' },
  ];

  return (
    <div className="min-h-screen bg-[#0A1929] text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0D2137] p-6 flex flex-col">
        <Link to="/" className="text-2xl font-bold mb-12 text-blue-400">
          RouteSync.Ai
        </Link>
        
        <nav className="flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                  isActive ? 'bg-blue-600' : 'hover:bg-blue-900'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-8 bg-blue-400 rounded-r"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <button className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;