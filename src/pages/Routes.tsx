import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Package as PackageIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix the default icon issue
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to fit bounds when coordinates change
const MapBoundsHandler = ({ coordinates }: { coordinates: [number, number][] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates.length >= 2) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);
  
  return null;
};

interface FormData {
  source: string;
  destination: string;
  weight: string;
  category: string;
  budget: string;
  timeline: string;
}

interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
}

const Routes = () => {
  const [formData, setFormData] = useState<FormData>({
    source: '',
    destination: '',
    weight: '',
    category: '',
    budget: '',
    timeline: ''
  });
  const [sourceCoordinates, setSourceCoordinates] = useState<[number, number] | null>(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState<[number, number] | null>(null);
  const [sourceName, setSourceName] = useState<string>('');
  const [destinationName, setDestinationName] = useState<string>('');
  const [routeType, setRouteType] = useState<string>('direct');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState<number>(0); // Used to force re-render the map

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to geocode an address using OpenStreetMap Nominatim API
  const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
    try {
      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      setError('Failed to geocode address. Please try again.');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Geocode source and destination
      const sourceResult = await geocodeAddress(formData.source);
      const destinationResult = await geocodeAddress(formData.destination);
      
      if (sourceResult && destinationResult) {
        setSourceCoordinates([sourceResult.lat, sourceResult.lon]);
        setDestinationCoordinates([destinationResult.lat, destinationResult.lon]);
        setSourceName(sourceResult.displayName);
        setDestinationName(destinationResult.displayName);
        
        // Force map re-render to update bounds
        setMapKey(prev => prev + 1);
        
        // Determine route type based on distance
        const distance = calculateDistance(
          sourceResult.lat, 
          sourceResult.lon, 
          destinationResult.lat, 
          destinationResult.lon
        );
        
        if (distance > 5000) {
          setRouteType('air');
        } else if (distance > 1000) {
          setRouteType('sea-land');
        } else {
          setRouteType('land');
        }
      } else {
        setError('Could not find coordinates for the entered locations. Please check the addresses and try again.');
      }
    } catch (err) {
      setError('An error occurred while processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate distance between two points in kilometers using the Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  const getRoutePolylineStyle = () => {
    switch (routeType) {
      case 'air':
        return { color: '#3B82F6', weight: 3, dashArray: '5,5' };
      case 'sea-land':
        return { color: '#8B5CF6', weight: 3, dashArray: '3,3' };
      case 'land':
      default:
        return { color: '#10B981', weight: 3 };
    }
  };

  // Calculate estimated cost based on distance and route type
  const calculateEstimatedCost = (): number | null => {
    if (!sourceCoordinates || !destinationCoordinates) return null;
    
    const distance = calculateDistance(
      sourceCoordinates[0], 
      sourceCoordinates[1], 
      destinationCoordinates[0], 
      destinationCoordinates[1]
    );
    
    // Base rates per km
    const rates = {
      land: 1.5,
      'sea-land': 2.2,
      air: 3.8
    };
    
    const baseRate = rates[routeType as keyof typeof rates] || rates.land;
    const weight = parseFloat(formData.weight) || 100; // Default to 100kg if not specified
    
    return Math.round(distance * baseRate * (weight / 100));
  };

  // Calculate estimated duration in hours
  const calculateEstimatedDuration = (): number | null => {
    if (!sourceCoordinates || !destinationCoordinates) return null;
    
    const distance = calculateDistance(
      sourceCoordinates[0], 
      sourceCoordinates[1], 
      destinationCoordinates[0], 
      destinationCoordinates[1]
    );
    
    // Speed in km/h
    const speeds = {
      land: 60,
      'sea-land': 30,
      air: 800
    };
    
    const speed = speeds[routeType as keyof typeof speeds] || speeds.land;
    
    return Math.round(distance / speed);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0D2137] p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold mb-6">Find Optimal Route</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Source Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full bg-[#162B44] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter source location (e.g., New York)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="w-full bg-[#162B44] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter destination (e.g., Los Angeles)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Cargo Weight (kg)</label>
              <div className="relative">
                <PackageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full bg-[#162B44] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter cargo weight"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Category of Goods</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-[#162B44] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                <option value="general">General Cargo</option>
                <option value="perishable">Perishable Goods</option>
                <option value="hazardous">Hazardous Materials</option>
                <option value="fragile">Fragile Items</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Budget ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full bg-[#162B44] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your budget"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Timeline (hours)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full bg-[#162B44] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter delivery timeline"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Finding Routes...' : 'Find Routes'}
            </button>
            
            {error && (
              <div className="mt-2 text-red-400 text-sm">{error}</div>
            )}
          </form>
        </motion.div>

        {/* Route Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0D2137] p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold mb-6">Route Information</h2>
          {sourceCoordinates && destinationCoordinates ? (
            <div className="space-y-4">
              <div className="bg-[#162B44] p-4 rounded-lg">
                <h3 className="font-medium text-gray-300 mb-2">Distance</h3>
                <p className="text-2xl font-bold">
                  {calculateDistance(
                    sourceCoordinates[0], 
                    sourceCoordinates[1], 
                    destinationCoordinates[0], 
                    destinationCoordinates[1]
                  ).toFixed(1)} km
                </p>
              </div>
              
              <div className="bg-[#162B44] p-4 rounded-lg">
                <h3 className="font-medium text-gray-300 mb-2">Estimated Cost</h3>
                <p className="text-2xl font-bold text-green-400">
                  ${calculateEstimatedCost()?.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-[#162B44] p-4 rounded-lg">
                <h3 className="font-medium text-gray-300 mb-2">Estimated Duration</h3>
                <p className="text-2xl font-bold">
                  {calculateEstimatedDuration()} hours
                </p>
              </div>
              
              <div className="bg-[#162B44] p-4 rounded-lg">
                <h3 className="font-medium text-gray-300 mb-2">Transportation Type</h3>
                <p className="text-2xl font-bold capitalize">
                  {routeType.replace('-', ' & ')}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Enter locations to see route information
            </div>
          )}
        </motion.div>
      </div>

      {/* Real-time Route Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#0D2137] p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold mb-6">Real-time Route Map</h2>
        <div className="h-[500px] rounded-lg overflow-hidden">
          <MapContainer
            key={mapKey}
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {sourceCoordinates && (
              <Marker position={sourceCoordinates}>
                <Popup>
                  <strong>Source:</strong> {sourceName}
                </Popup>
              </Marker>
            )}
            
            {destinationCoordinates && (
              <Marker position={destinationCoordinates}>
                <Popup>
                  <strong>Destination:</strong> {destinationName}
                </Popup>
              </Marker>
            )}
            
            {sourceCoordinates && destinationCoordinates && (
              <Polyline 
                positions={[sourceCoordinates, destinationCoordinates]} 
                pathOptions={getRoutePolylineStyle()} 
              />
            )}
            
            {sourceCoordinates && destinationCoordinates && (
              <MapBoundsHandler 
                coordinates={[sourceCoordinates, destinationCoordinates]} 
              />
            )}
          </MapContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Routes;