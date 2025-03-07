"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  MapPin,
  Clock,
  DollarSign,
  PackageIcon,
  Search,
  Grid,
  Bell,
  ChevronRight,
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudSun,
} from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Custom marker icons
const createCustomIcon = (iconUrl: string, size: [number, number] = [32, 32], anchor: [number, number] = [16, 16]) => {
  return L.icon({
    iconUrl,
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor: [0, -anchor[1]],
  })
}

// Define icons for different vehicle types
const planeIcon = createCustomIcon("/plane-icon.svg", [36, 36])
const shipIcon = createCustomIcon("/ship-icon.svg", [32, 32])
const truckIcon = createCustomIcon("/truck-icon.svg", [30, 30])
const sourceIcon = createCustomIcon("/source-marker.svg", [40, 40], [20, 40])
const destinationIcon = createCustomIcon("/destination-marker.svg", [40, 40], [20, 40])

// Vehicle animation component
const MovingVehicle = ({
  routeCoordinates,
  vehicleType,
  duration = 60000,
  onClick,
}: {
  routeCoordinates: [number, number][]
  vehicleType: "plane" | "ship" | "truck"
  duration?: number
  onClick: () => void
}) => {
  const [position, setPosition] = useState<[number, number]>(routeCoordinates[0])
  const [rotation, setRotation] = useState(0)
  const map = useMap()
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const lastPointIndexRef = useRef(0)

  // Get the appropriate icon based on vehicle type
  const getVehicleIcon = () => {
    switch (vehicleType) {
      case "plane":
        return planeIcon
      case "ship":
        return shipIcon
      case "truck":
        return truckIcon
      default:
        return planeIcon
    }
  }

  // Calculate rotation angle between two points
  const calculateRotation = (from: [number, number], to: [number, number]) => {
    const dx = to[1] - from[1]
    const dy = to[0] - from[0]
    return Math.atan2(dx, dy) * (180 / Math.PI)
  }

  // Animate the vehicle along the route
  useEffect(() => {
    if (routeCoordinates.length < 2) return

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Calculate current position along the route
      const totalPoints = routeCoordinates.length
      const pointIndex = Math.min(Math.floor(progress * (totalPoints - 1)), totalPoints - 1)

      // If we've moved to a new point, update rotation
      if (pointIndex !== lastPointIndexRef.current && pointIndex < totalPoints - 1) {
        const currentPoint = routeCoordinates[pointIndex]
        const nextPoint = routeCoordinates[pointIndex + 1]
        setRotation(calculateRotation(currentPoint, nextPoint))
        lastPointIndexRef.current = pointIndex
      }

      // Interpolate between points for smooth movement
      if (pointIndex < totalPoints - 1) {
        const currentPoint = routeCoordinates[pointIndex]
        const nextPoint = routeCoordinates[pointIndex + 1]
        const pointProgress = (progress * (totalPoints - 1)) % 1

        const lat = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * pointProgress
        const lng = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * pointProgress

        setPosition([lat, lng])
      } else {
        setPosition(routeCoordinates[totalPoints - 1])
      }

      // Continue animation if not complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Restart animation when complete
        startTimeRef.current = null
        lastPointIndexRef.current = 0
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [routeCoordinates, duration])

  return (
    <Marker
      position={position}
      icon={getVehicleIcon()}
      rotationAngle={rotation}
      rotationOrigin="center"
      eventHandlers={{
        click: () => {
          onClick()
        },
      }}
    />
  )
}

// Custom map style component
const MapStyler = () => {
  const map = useMap()

  useEffect(() => {
    // Apply Google Maps-like styling
    map.getContainer().style.background = "#0A1929"

    // Add custom controls
    const zoomInButton = L.control({ position: "bottomright" })
    zoomInButton.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-control-zoom-in")
      div.innerHTML = `<button class="bg-white/10 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/20 transition-colors">+</button>`
      div.onclick = () => map.zoomIn()
      return div
    }

    const zoomOutButton = L.control({ position: "bottomright" })
    zoomOutButton.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-control-zoom-out")
      div.innerHTML = `<button class="bg-white/10 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/20 transition-colors mt-2">-</button>`
      div.onclick = () => map.zoomOut()
      return div
    }

    zoomInButton.addTo(map)
    zoomOutButton.addTo(map)

    return () => {
      map.removeControl(zoomInButton)
      map.removeControl(zoomOutButton)
    }
  }, [map])

  return null
}

// Helper component to fit bounds when coordinates change
const MapBoundsHandler = ({ coordinates }: { coordinates: [number, number][] }) => {
  const map = useMap()

  useEffect(() => {
    if (coordinates.length >= 2) {
      const bounds = L.latLngBounds(coordinates)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [coordinates, map])

  return null
}

interface FormData {
  source: string
  destination: string
  weight: string
  category: string
  budget: string
  timeline: string
}

interface GeocodingResult {
  lat: number
  lon: number
  displayName: string
}

interface RouteInfo {
  id: number
  name: string
  time: string
  value: string
  type: "land" | "air-land" | "sea-land"
  status: "active" | "completed" | "scheduled"
}

interface WeatherDay {
  day: string
  icon: React.ReactNode
  temp: string
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
  const [mapKey, setMapKey] = useState<number>(0);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<{
    type: string;
    id: string;
    status: string;
    speed: string;
    eta: string;
    origin: string;
    destination: string;
    cargo: string;
  } | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    type: 'source' | 'destination';
    coordinates: [number, number];
    address: string;
  } | null>(null);
  
  // Sample route data
  const [availableRoutes, setAvailableRoutes] = useState<RouteInfo[]>([
    { id: 1, name: 'Land Route 1', time: 'Today, 15:36', value: '+$50', type: 'land', status: 'active' },
    { id: 2, name: 'Air and Land Route 2', time: 'Today, 08:49', value: '-$27', type: 'air-land', status: 'active' },
    { id: 3, name: 'Sea + Land Route 3', time: 'Yesterday, 14:36', value: '+$157', type: 'sea-land', status: 'completed' },
  ]);
  
  // Sample weather data
  const weatherData: WeatherDay[] = [
    { day: 'Monday', icon: <Cloud className="w-6 h-6" />, temp: '18°C' },
    { day: 'Tuesday', icon: <CloudRain className="w-6 h-6" />, temp: '15°C' },
    { day: 'Wednesday', icon: <CloudSnow className="w-6 h-6" />, temp: '12°C' },
    { day: 'Thursday', icon: <CloudSun className="w-6 h-6" />, temp: '20°C' },
    { day: 'Friday', icon: <Sun className="w-6 h-6" />, temp: '22°C' },
  ];
  
  // Generate intermediate points for route animation
  const generateRoutePoints = (start: [number, number], end: [number, number], numPoints = 20): [number, number][] => {
    const points: [number, number][] = [];
    
    // For air routes, create an arc
    if (routeType === 'air') {
      // Calculate midpoint with higher altitude (represented by latitude offset)
      const midLat = (start[0] + end[0]) / 2;
      const midLng = (start[1] + end[1]) / 2;
      
      // Calculate distance to determine arc height
      const distance = calculateDistance(start[0], start[1], end[0], end[1]);
      const arcHeight = Math.min(distance / 30, 5); // Cap the arc height
      
      // Create curved path
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const lat = start[0] * (1 - t) * (1 - t) + midLat * 2 * t * (1 - t) + end[0] * t * t;
        const lng = start[1] * (1 - t) * (1 - t) + midLng * 2 * t * (1 - t) + end[1] * t * t;
        points.push([lat, lng]);
      }
    } else {
      // For land/sea routes, create a straight line with more points
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const lat = start[0] + (end[0] - start[0]) * t;
        const lng = start[1] + (end[1] - start[1]) * t;
        points.push([lat, lng]);
      }
    }
    
    return points;
  };

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
          lat: Number.parseFloat(data[0].lat),
          lon: Number.parseFloat(data[0].lon),
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
        
        // Add new route to available routes
        const newRoute: RouteInfo = {
          id: availableRoutes.length + 1,
          name: `${routeType === 'air' ? 'Air' : routeType === 'sea-land' ? 'Sea + Land' : 'Land'} Route ${availableRoutes.length + 1}`,
          time: `Today, ${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`,
          value: `+$${Math.floor(calculateEstimatedCost(distance, routeType, Number.parseFloat(formData.weight) || 100) || 0)}`,
          type: routeType === 'air' ? 'air-land' : routeType === 'sea-land' ? 'sea-land' : 'land',
          status: 'active'
        };
        
        setAvailableRoutes(prev => [newRoute, ...prev]);
        setShowFormModal(false);
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

  const getRoutePolylineStyle = (type: string = routeType) => {
    switch (type) {
      case 'air':
      case 'air-land':
        return { color: '#FF4B4B', weight: 3, dashArray: '5,5', opacity: 0.8 };
      case 'sea-land':
        return { color: '#4B9FFF', weight: 3, dashArray: '3,3', opacity: 0.8 };
      case 'land':
      default:
        return { color: '#10B981', weight: 3, opacity: 0.8 };
    }
  };

  // Calculate estimated cost based on distance and route type
  const calculateEstimatedCost = (
    distance?: number, 
    type: string = routeType, 
    weight: number = Number.parseFloat(formData.weight) || 100
  ): number | null => {
    if (!distance && (!sourceCoordinates || !destinationCoordinates)) return null;
    
    const calculatedDistance = distance || calculateDistance(
      sourceCoordinates![0], 
      sourceCoordinates![1], 
      destinationCoordinates![0], 
      destinationCoordinates![1]
    );
    
    // Base rates per km
    const rates = {
      land: 1.5,
      'sea-land': 2.2,
      air: 3.8,
      'air-land': 3.8
    };
    
    const baseRate = rates[type as keyof typeof rates] || rates.land;
    
    return Math.round(calculatedDistance * baseRate * (weight / 100));
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
      air: 800,
      'air-land': 800
    };
    
    const speed = speeds[routeType as keyof typeof speeds] || speeds.land;
    
    return Math.round(distance / speed);
  };
  
  // Handle vehicle click
  const handleVehicleClick = (type: string) => {
    setSelectedVehicle({
      type,
      id: `${type.toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      status: 'In Transit',
      speed: type === 'plane' ? '800 km/h' : type === 'ship' ? '30 km/h' : '60 km/h',
      eta: `${new Date(Date.now() + 1000 * 60 * 60 * (calculateEstimatedDuration() || 5)).toLocaleTimeString()}`,
      origin: sourceName,
      destination: destinationName,
      cargo: `${formData.weight || '100'} kg of ${formData.category || 'General Cargo'}`
    });
    setShowVehicleModal(true);
  };
  
  // Handle location marker click
  const handleLocationClick = (type: 'source' | 'destination') => {
    const coordinates = type === 'source' ? sourceCoordinates : destinationCoordinates;
    const name = type === 'source' ? sourceName : destinationName;
    
    if (coordinates) {
      setSelectedLocation({
        name: name.split(',')[0],
        type,
        coordinates,
        address: name
      });
      setShowLocationModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1929] text-white">
      {/* Header */}
      <header className="bg-[#0D2137]/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-blue-900/30">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            <span className="text-white">Route</span>
            <span className="text-blue-400">Sync.Ai</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search routes..."
              className="bg-[#162B44]/70 rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Grid className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          <Avatar className="w-10 h-10 border-2 border-blue-500">
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 p-4">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Active Routes Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0D2137]/80 backdrop-blur-md p-4 rounded-xl border border-blue-900/30"
          >
            <h2 className="text-xl font-semibold mb-4 text-center bg-[#1A365D] py-2 rounded-lg">Active Routes</h2>
            <h3 className="text-lg font-medium mb-2">Available Routes</h3>
            <div className="space-y-2">
              {availableRoutes.map((route) => (
                <div key={route.id} className="border-b border-blue-900/30 pb-2 last:border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{route.name}</div>
                      <div className="text-sm text-gray-400">{route.time}</div>
                    </div>
                    <div className={`font-medium ${route.value.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {route.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <Button 
                variant="ghost" 
                className="text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors"
                onClick={() => setShowFormModal(true)}
              >
                View all <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Weather Report Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0D2137]/80 backdrop-blur-md p-4 rounded-xl border border-blue-900/30"
          >
            <h2 className="text-xl font-semibold mb-4 text-center bg-[#1A365D] py-2 rounded-lg">Weather Report</h2>
            <h3 className="text-lg font-medium mb-2">Weekly Weather</h3>
            <div className="space-y-2">
              {weatherData.map((day, index) => (
                <div key={index} className="border-b border-blue-900/30 pb-2 last:border-0">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{day.day}</div>
                    <div className="flex items-center gap-2">
                      {day.icon}
                      <span>{day.temp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <Button variant="ghost" className="text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors">
                View all <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
          
          {/* Add Route Button */}
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            onClick={() => setShowFormModal(true)}
          >
            Add New Route
          </Button>
        </div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0D2137]/80 backdrop-blur-md rounded-xl border border-blue-900/30 overflow-hidden"
        >
          <div className="h-[calc(100vh-8rem)] w-full relative">
            <MapContainer
              key={mapKey}
              center={[30, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              
              <MapStyler />
              
              {sourceCoordinates && (
                <Marker 
                  position={sourceCoordinates} 
                  icon={sourceIcon}
                  eventHandlers={{
                    click: () => handleLocationClick('source')
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="font-medium">Source: {sourceName.split(',')[0]}</div>
                    <Button 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => handleLocationClick('source')}
                    >
                      View Details
                    </Button>
                  </Popup>
                </Marker>
              )}
              
              {destinationCoordinates && (
                <Marker 
                  position={destinationCoordinates} 
                  icon={destinationIcon}
                  eventHandlers={{
                    click: () => handleLocationClick('destination')
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="font-medium">Destination: {destinationName.split(',')[0]}</div>
                    <Button 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => handleLocationClick('destination')}
                    >
                      View Details
                    </Button>
                  </Popup>
                </Marker>
              )}
              
              {sourceCoordinates && destinationCoordinates && (
                <>
                  <Polyline 
                    positions={[sourceCoordinates, destinationCoordinates]} 
                    pathOptions={getRoutePolylineStyle()} 
                  />
                  
                  {/* Add moving vehicles based on route type */}
                  {routeType === 'air' && (
                    <MovingVehicle 
                      routeCoordinates={generateRoutePoints(sourceCoordinates, destinationCoordinates, 50)} 
                      vehicleType="plane"
                      duration={60000}
                      onClick={() => handleVehicleClick('plane')}
                    />
                  )}
                  
                  {routeType === 'sea-land' && (
                    <>
                      <MovingVehicle 
                        routeCoordinates={generateRoutePoints(sourceCoordinates, destinationCoordinates, 50)} 
                        vehicleType="ship"
                        duration={120000}
                        onClick={() => handleVehicleClick('ship')}
                      />
                      <MovingVehicle 
                        routeCoordinates={generateRoutePoints(
                          [destinationCoordinates[0] - (destinationCoordinates[0] - sourceCoordinates[0]) * 0.3, 
                           destinationCoordinates[1] - (destinationCoordinates[1] - sourceCoordinates[1]) * 0.3],
                          destinationCoordinates, 
                          20
                        )} 
                        vehicleType="truck"
                        duration={40000}
                        onClick={() => handleVehicleClick('truck')}
                      />
                    </>
                  )}
                  
                  {routeType === 'land' && (
                    <MovingVehicle 
                      routeCoordinates={generateRoutePoints(sourceCoordinates, destinationCoordinates, 30)} 
                      vehicleType="truck"
                      duration={80000}
                      onClick={() => handleVehicleClick('truck')}
                    />
                  )}
                </>
              )}
              
              {sourceCoordinates && destinationCoordinates && (
                <MapBoundsHandler 
                  coordinates={[sourceCoordinates, destinationCoordinates]} 
                />
              )}
            </MapContainer>
            
            {/* Map Overlay Elements */}
            <div className="absolute top-4 left-4 z-[1000] bg-[#0D2137]/80 backdrop-blur-md p-3 rounded-lg border border-blue-900/30">
              <h3 className="font-medium text-sm mb-2">Route Information</h3>
              {sourceCoordinates && destinationCoordinates ? (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                      {routeType === 'air' ? 'Air Route' : routeType === 'sea-land' ? 'Sea & Land Route' : 'Land Route'}
                    </Badge>
                  </div>
                  <div>
                    Distance: {calculateDistance(
                      sourceCoordinates[0], 
                      sourceCoordinates[1], 
                      destinationCoordinates[0], 
                      destinationCoordinates[1]
                    ).toFixed(1)} km
                  </div>
                  <div>
                    ETA: {calculateEstimatedDuration()} hours
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  Add a route to see details
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Route Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="bg-[#0D2137] border border-blue-900/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the details to find the optimal route for your cargo.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Source Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400\" size={18}                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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

            <div className="flex gap-2 justify-end mt-6">
              <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? 'Finding Routes...' : 'Find Routes'}
              </Button>
            </div>
            
            {error && (
              <div className="mt-2 text-red-400 text-sm">{error}</div>
            )}
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Vehicle Details Modal */}
      <Dialog open={showVehicleModal} onOpenChange={setShowVehicleModal}>
        <DialogContent className="bg-[#0D2137] border border-blue-900/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">{selectedVehicle?.type} Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Real-time information about this transport vehicle.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#162B44] p-3 rounded-lg">
                  <div className="text-sm text-gray-400">ID</div>
                  <div className="font-medium">{selectedVehicle.id}</div>
                </div>
                <div className="bg-[#162B44] p-3 rounded-lg">
                  <div className="text-sm text-gray-400">Status</div>
                  <div className="font-medium text-green-400">{selectedVehicle.status}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#162B44] p-3 rounded-lg">
                  <div className="text-sm text-gray-400">Speed</div>
                  <div className="font-medium">{selectedVehicle.speed}</div>
                </div>
                <div className="bg-[#162B44] p-3 rounded-lg">
                  <div className="text-sm text-gray-400">ETA</div>
                  <div className="font-medium">{selectedVehicle.eta}</div>
                </div>
              </div>
              
              <div className="bg-[#162B44] p-3 rounded-lg">
                <div className="text-sm text-gray-400">Route</div>
                <div className="font-medium">
                  {selectedVehicle.origin.split(',')[0]} → {selectedVehicle.destination.split(',')[0]}
                </div>
              </div>
              
              <div className="bg-[#162B44] p-3 rounded-lg">
                <div className="text-sm text-gray-400">Cargo</div>
                <div className="font-medium">{selectedVehicle.cargo}</div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowVehicleModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Location Details Modal */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="bg-[#0D2137] border border-blue-900/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedLocation?.type === 'source' ? 'Source' : 'Destination'}: {selectedLocation?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Location details and information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLocation && (
            <div className="space-y-4 mt-4">
              <div className="bg-[#162B44] p-3 rounded-lg">
                <div className="text-sm text-gray-400">Full Address</div>
                <div className="font-medium">{selectedLocation.address}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#162B44] p-3 rounded-lg">
                  <div className="text-sm text-gray-400">Latitude</div>
                  <div className="font-medium">{selectedLocation.coordinates[0].toFixed(6)}</div>
                </div>
                <div className="bg-[#162B44] p-3 rounded-lg">
                  <div className="text-sm text-gray-400">Longitude</div>
                  <div className="font-medium">{selectedLocation.coordinates[1].toFixed(6)}</div>
                </div>
              </div>
              
              <div className="bg-[#162B44] p-3 rounded-lg">
                <div className="text-sm text-gray-400">Local Time</div>
                <div className="font-medium">{new Date().toLocaleTimeString()}</div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowLocationModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Custom CSS for map styling */}
      <style jsx global>{`
        .leaflet-container {
          background: #0A1929;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .leaflet-popup-content-wrapper {
          background: #0D2137;
          color: white;
          border-radius: 8px;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        
        .leaflet-popup-tip {
          background: #0D2137;
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 12px;
        }
      `}</style>
    </div>
  );
};

export default Routes;

