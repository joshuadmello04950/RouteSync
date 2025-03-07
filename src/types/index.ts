export interface Route {
  id: string;
  name: string;
  type: 'land' | 'air' | 'sea' | 'air-land' | 'sea-land';
  origin: string;
  destination: string;
  cost: number;
  duration: number;
  weather: string;
  status: string;
  timestamp: string;
}

export interface Shipment {
  id: string;
  customerName: string;
  company: string;
  phoneNumber: string;
  email: string;
  country: string;
  status: 'active' | 'inactive';
}

export interface WeatherReport {
  day: string;
  condition: string;
}

export interface RouteInsight {
  feasibility: number;
  legal: number;
  cost: number;
  weather: number;
}