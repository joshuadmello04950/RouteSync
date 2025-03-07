import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Ship, Truck, Cloud, Sun, CloudRain, CloudSun, Cloud as CloudIcon } from 'lucide-react';
import type { Route, WeatherReport } from '../types';

const mockRoutes: Route[] = [
  {
    id: '1',
    name: 'Land Route 1',
    type: 'land',
    origin: 'New York',
    destination: 'Los Angeles',
    cost: 2500,
    duration: 72,
    weather: 'clear',
    status: 'active',
    timestamp: '2024-03-10T10:00:00Z'
  },
  {
    id: '2',
    name: 'Air and Land Route 2',
    type: 'air-land',
    origin: 'London',
    destination: 'Paris',
    cost: 1800,
    duration: 24,
    weather: 'cloudy',
    status: 'active',
    timestamp: '2024-03-10T11:00:00Z'
  },
  {
    id: '3',
    name: 'Sea + Land Route 3',
    type: 'sea-land',
    origin: 'Tokyo',
    destination: 'Shanghai',
    cost: 3500,
    duration: 96,
    weather: 'rainy',
    status: 'active',
    timestamp: '2024-03-09T15:00:00Z'
  }
];

const weatherReports: WeatherReport[] = [
  { day: 'Monday', condition: 'cloudy' },
  { day: 'Tuesday', condition: 'rainy' },
  { day: 'Wednesday', condition: 'rainy' },
  { day: 'Thursday', condition: 'sunny' },
  { day: 'Friday', condition: 'cloudy' }
];

const RoutesPage = () => {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="text-yellow-400" />;
      case 'rainy':
        return <CloudRain className="text-blue-400" />;
      case 'cloudy':
        return <CloudIcon className="text-gray-400" />;
      default:
        return <CloudSun className="text-gray-400" />;
    }
  };

  const getRouteIcon = (type: string) => {
    switch (type) {
      case 'land':
        return <Truck className="text-green-400" />;
      case 'air':
        return <Plane className="text-blue-400" />;
      case 'sea':
        return <Ship className="text-purple-400" />;
      case 'air-land':
        return (
          <div className="flex gap-2">
            <Plane className="text-blue-400" />
            <Truck className="text-green-400" />
          </div>
        );
      case 'sea-land':
        return (
          <div className="flex gap-2">
            <Ship className="text-purple-400" />
            <Truck className="text-green-400" />
          </div>
        );
      default:
        return <Truck className="text-green-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Routes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0D2137] p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold mb-6">Active Routes</h2>
          <div className="space-y-4">
            {mockRoutes.map((route) => (
              <motion.div
                key={route.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedRoute?.id === route.id ? 'bg-blue-600' : 'bg-[#162B44] hover:bg-[#1E3A5F]'
                }`}
                onClick={() => setSelectedRoute(route)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getRouteIcon(route.type)}
                    <div>
                      <h3 className="font-semibold">{route.name}</h3>
                      <p className="text-sm text-gray-400">
                        {route.origin} → {route.destination}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400">+${route.cost}</p>
                    <p className="text-sm text-gray-400">{route.duration}h</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weather Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0D2137] p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold mb-6">Weather Report</h2>
          <div className="space-y-4">
            {weatherReports.map((report) => (
              <div
                key={report.day}
                className="bg-[#162B44] p-4 rounded-lg flex items-center justify-between"
              >
                <span className="font-medium">{report.day}</span>
                {getWeatherIcon(report.condition)}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Route Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#0D2137] p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold mb-6">Route Map</h2>
        <div className="h-[400px] bg-[#162B44] rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-50">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80"
              alt="World Map"
              className="w-full h-full object-cover"
            />
          </div>
          {selectedRoute && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-[#0D2137] p-6 rounded-xl max-w-md">
                <h3 className="text-xl font-semibold mb-4">{selectedRoute.name}</h3>
                <div className="space-y-2">
                  <p>Origin: {selectedRoute.origin}</p>
                  <p>Destination: {selectedRoute.destination}</p>
                  <p>Cost: ${selectedRoute.cost}</p>
                  <p>Duration: {selectedRoute.duration} hours</p>
                  <p>Type: {selectedRoute.type}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RoutesPage;