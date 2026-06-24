/**
 * SafeSphere Demo and GIS Telemetry Data
 * Pre-configured data for global cities, cooling shelters, and real-time IoT feeds.
 */

import { ThermodynamicParams } from './physics-engine';

export interface CityData {
  id: string;
  name: string;
  country: string;
  coords: { lat: number; lng: number };
  baseParams: ThermodynamicParams;
  population: number;
  vulnerabilityIndex: number; // 0 to 100
  disasterAlert?: {
    type: 'Heatwave' | 'Flood' | 'Wildfire' | 'None';
    severity: 'Advisory' | 'Warning' | 'Critical' | 'None';
    message: string;
  };
  coolingShelters: CoolingShelter[];
  iotSensors: IoTSensor[];
  historicalTrends: { year: number; lst: number; airTemp: number }[];
}

export interface CoolingShelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
  status: 'Open' | 'Full' | 'Closed';
  distanceMeters: number;
  contact: string;
}

export interface IoTSensor {
  id: string;
  name: string;
  type: 'Temperature' | 'Humidity' | 'Wind' | 'AQI';
  value: number;
  unit: string;
  status: 'Active' | 'Warning' | 'Failure';
  lastUpdated: string;
  history: number[]; // past 6 hours
}

export const CITIES_DATA: CityData[] = [
  {
    id: 'phoenix',
    name: 'Phoenix',
    country: 'USA',
    coords: { lat: 33.4484, lng: -112.0740 },
    population: 1600000,
    vulnerabilityIndex: 78,
    disasterAlert: {
      type: 'Heatwave',
      severity: 'Critical',
      message: 'Excessive Heat Warning active. Temperatures projected to break 46°C.'
    },
    baseParams: {
      airTemp: 42.5,
      albedo: 0.15,
      ndvi: 0.10,
      solarRad: 960,
      windSpeed: 2.1,
      relativeHumidity: 15,
      buildingDensity: 75,
      buildingHeight: 38
    },
    coolingShelters: [
      {
        id: 'phx-1',
        name: 'Downtown Convention Center - Hall B',
        address: '100 N 3rd St, Phoenix, AZ 85004',
        lat: 33.4488,
        lng: -112.0695,
        capacity: 500,
        occupied: 185,
        status: 'Open',
        distanceMeters: 450,
        contact: '(602) 555-0101'
      },
      {
        id: 'phx-2',
        name: 'Burton Barr Central Library',
        address: '1221 N Central Ave, Phoenix, AZ 85004',
        lat: 33.4610,
        lng: -112.0738,
        capacity: 250,
        occupied: 110,
        status: 'Open',
        distanceMeters: 1400,
        contact: '(602) 555-0102'
      },
      {
        id: 'phx-3',
        name: 'South Mountain Community Center',
        address: '212 E Alta Vista Rd, Phoenix, AZ 85042',
        lat: 33.3980,
        lng: -112.0715,
        capacity: 150,
        occupied: 148,
        status: 'Full',
        distanceMeters: 5600,
        contact: '(602) 555-0103'
      }
    ],
    iotSensors: [
      {
        id: 'phx-s1',
        name: 'Downtown Canyon Monitor 1A',
        type: 'Temperature',
        value: 43.1,
        unit: '°C',
        status: 'Active',
        lastUpdated: '1 min ago',
        history: [40.2, 41.5, 42.1, 42.8, 43.0, 43.1]
      },
      {
        id: 'phx-s2',
        name: 'Downtown Canyon Monitor 1B',
        type: 'Humidity',
        value: 14,
        unit: '%',
        status: 'Active',
        lastUpdated: '1 min ago',
        history: [18, 17, 16, 15, 14, 14]
      },
      {
        id: 'phx-s3',
        name: 'South Mountain Met-Station',
        type: 'Wind',
        value: 2.4,
        unit: 'm/s',
        status: 'Active',
        lastUpdated: '5 min ago',
        history: [1.8, 2.0, 2.2, 2.5, 2.4, 2.4]
      },
      {
        id: 'phx-s4',
        name: 'Roosevelt Grid AQI-Station',
        type: 'AQI',
        value: 125,
        unit: 'US AQI',
        status: 'Warning',
        lastUpdated: '3 min ago',
        history: [95, 102, 115, 120, 122, 125]
      }
    ],
    historicalTrends: [
      { year: 2017, lst: 39.8, airTemp: 37.1 },
      { year: 2018, lst: 40.2, airTemp: 37.4 },
      { year: 2019, lst: 40.7, airTemp: 37.9 },
      { year: 2020, lst: 41.5, airTemp: 38.5 },
      { year: 2021, lst: 41.2, airTemp: 38.3 },
      { year: 2022, lst: 41.9, airTemp: 38.8 },
      { year: 2023, lst: 42.6, airTemp: 39.4 },
      { year: 2024, lst: 43.2, airTemp: 39.9 },
      { year: 2025, lst: 43.8, airTemp: 40.5 },
      { year: 2026, lst: 44.5, airTemp: 41.2 }
    ]
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    coords: { lat: 1.3521, lng: 103.8198 },
    population: 5900000,
    vulnerabilityIndex: 45,
    disasterAlert: {
      type: 'Heatwave',
      severity: 'Warning',
      message: 'High humidity heat stress advisory. Wet Bulb temperatures approaching 29°C.'
    },
    baseParams: {
      airTemp: 32.5,
      albedo: 0.22,
      ndvi: 0.58,
      solarRad: 820,
      windSpeed: 1.5,
      relativeHumidity: 78,
      buildingDensity: 65,
      buildingHeight: 120
    },
    coolingShelters: [
      {
        id: 'sg-1',
        name: 'Marina Bay Cooling Plaza',
        address: '10 Bayfront Ave, Singapore 018956',
        lat: 1.3590,
        lng: 103.8590,
        capacity: 400,
        occupied: 90,
        status: 'Open',
        distanceMeters: 800,
        contact: '+65 6555 1010'
      },
      {
        id: 'sg-2',
        name: 'Tampines Hub Vault',
        address: '1 Tampines Walk, Singapore 528523',
        lat: 1.3532,
        lng: 103.9400,
        capacity: 300,
        occupied: 45,
        status: 'Open',
        distanceMeters: 13500,
        contact: '+65 6555 1011'
      }
    ],
    iotSensors: [
      {
        id: 'sg-s1',
        name: 'Orchard Rd Thermal Loop',
        type: 'Temperature',
        value: 33.4,
        unit: '°C',
        status: 'Active',
        lastUpdated: '2 min ago',
        history: [31.5, 32.0, 32.5, 33.1, 33.3, 33.4]
      },
      {
        id: 'sg-s2',
        name: 'Changi Coastal AQI Monitor',
        type: 'AQI',
        value: 48,
        unit: 'US AQI',
        status: 'Active',
        lastUpdated: '10 min ago',
        history: [52, 51, 50, 49, 48, 48]
      }
    ],
    historicalTrends: [
      { year: 2017, lst: 33.1, airTemp: 28.2 },
      { year: 2018, lst: 33.3, airTemp: 28.4 },
      { year: 2019, lst: 33.6, airTemp: 28.7 },
      { year: 2020, lst: 33.8, airTemp: 28.9 },
      { year: 2021, lst: 33.7, airTemp: 28.8 },
      { year: 2022, lst: 34.0, airTemp: 29.1 },
      { year: 2023, lst: 34.3, airTemp: 29.4 },
      { year: 2024, lst: 34.5, airTemp: 29.6 },
      { year: 2025, lst: 34.8, airTemp: 29.9 },
      { year: 2026, lst: 35.1, airTemp: 30.2 }
    ]
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    country: 'India',
    coords: { lat: 23.0225, lng: 72.5714 },
    population: 8200000,
    vulnerabilityIndex: 85,
    disasterAlert: {
      type: 'Heatwave',
      severity: 'Critical',
      message: 'AMC Heat Action Plan Orange Alert active. Extreme hazard for construction workers.'
    },
    baseParams: {
      airTemp: 44.0,
      albedo: 0.18,
      ndvi: 0.12,
      solarRad: 980,
      windSpeed: 2.8,
      relativeHumidity: 22,
      buildingDensity: 82,
      buildingHeight: 18
    },
    coolingShelters: [
      {
        id: 'ahm-1',
        name: 'Maninagar Community Hall',
        address: 'Rambaug Cross Rd, Maninagar, Ahmedabad, 380008',
        lat: 22.9965,
        lng: 72.5995,
        capacity: 350,
        occupied: 320,
        status: 'Open',
        distanceMeters: 3800,
        contact: '+91 79 5550 9101'
      },
      {
        id: 'ahm-2',
        name: 'AMC Multi-Purpose Hall',
        address: 'Paldi, Ahmedabad, 380007',
        lat: 23.0135,
        lng: 72.5620,
        capacity: 200,
        occupied: 198,
        status: 'Full',
        distanceMeters: 1400,
        contact: '+91 79 5550 9102'
      }
    ],
    iotSensors: [
      {
        id: 'ahm-s1',
        name: 'Kalupur Junction Ingest',
        type: 'Temperature',
        value: 45.3,
        unit: '°C',
        status: 'Warning',
        lastUpdated: '1 min ago',
        history: [42.1, 43.5, 44.2, 44.8, 45.1, 45.3]
      },
      {
        id: 'ahm-s2',
        name: 'Kalupur Junction AQI',
        type: 'AQI',
        value: 165,
        unit: 'US AQI',
        status: 'Failure',
        lastUpdated: '2 min ago',
        history: [142, 150, 158, 160, 163, 165]
      }
    ],
    historicalTrends: [
      { year: 2017, lst: 42.1, airTemp: 39.1 },
      { year: 2018, lst: 42.4, airTemp: 39.4 },
      { year: 2019, lst: 42.8, airTemp: 39.8 },
      { year: 2020, lst: 43.2, airTemp: 40.2 },
      { year: 2021, lst: 43.1, airTemp: 40.0 },
      { year: 2022, lst: 43.5, airTemp: 40.4 },
      { year: 2023, lst: 43.9, airTemp: 40.8 },
      { year: 2024, lst: 44.3, airTemp: 41.2 },
      { year: 2025, lst: 44.8, airTemp: 41.7 },
      { year: 2026, lst: 45.4, airTemp: 42.3 }
    ]
  },
  {
    id: 'melbourne',
    name: 'Melbourne',
    country: 'Australia',
    coords: { lat: -37.8136, lng: 144.9631 },
    population: 5000000,
    vulnerabilityIndex: 32,
    disasterAlert: {
      type: 'None',
      severity: 'None',
      message: 'Normal conditions. Low thermal stress indices.'
    },
    baseParams: {
      airTemp: 24.5,
      albedo: 0.20,
      ndvi: 0.45,
      solarRad: 580,
      windSpeed: 4.8,
      relativeHumidity: 48,
      buildingDensity: 52,
      buildingHeight: 48
    },
    coolingShelters: [
      {
        id: 'mel-1',
        name: 'State Library Victoria Safe Zone',
        address: '328 Swanston St, Melbourne VIC 3000',
        lat: -37.8098,
        lng: 144.9652,
        capacity: 150,
        occupied: 12,
        status: 'Open',
        distanceMeters: 450,
        contact: '(03) 9555 2020'
      }
    ],
    iotSensors: [
      {
        id: 'mel-s1',
        name: 'Fed Square Thermal Sensor',
        type: 'Temperature',
        value: 24.8,
        unit: '°C',
        status: 'Active',
        lastUpdated: '12 min ago',
        history: [25.6, 25.4, 25.1, 24.9, 24.8, 24.8]
      }
    ],
    historicalTrends: [
      { year: 2017, lst: 26.2, airTemp: 23.1 },
      { year: 2018, lst: 26.3, airTemp: 23.2 },
      { year: 2019, lst: 26.6, airTemp: 23.5 },
      { year: 2020, lst: 26.9, airTemp: 23.8 },
      { year: 2021, lst: 26.7, airTemp: 23.6 },
      { year: 2022, lst: 27.0, airTemp: 23.9 },
      { year: 2023, lst: 27.2, airTemp: 24.1 },
      { year: 2024, lst: 27.4, airTemp: 24.3 },
      { year: 2025, lst: 27.6, airTemp: 24.5 },
      { year: 2026, lst: 27.9, airTemp: 24.8 }
    ]
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    coords: { lat: 48.8566, lng: 2.3522 },
    population: 2100000,
    vulnerabilityIndex: 62,
    disasterAlert: {
      type: 'Heatwave',
      severity: 'Warning',
      message: 'Plan Canicule Level 3. Temperatures in metropolitan region approaching 38°C.'
    },
    baseParams: {
      airTemp: 36.2,
      albedo: 0.16,
      ndvi: 0.22,
      solarRad: 790,
      windSpeed: 2.9,
      relativeHumidity: 32,
      buildingDensity: 72,
      buildingHeight: 24
    },
    coolingShelters: [
      {
        id: 'par-1',
        name: 'Gymnase Japy Cooling Shelter',
        address: '8 Rue Japy, 75011 Paris',
        lat: 48.8550,
        lng: 2.3810,
        capacity: 200,
        occupied: 112,
        status: 'Open',
        distanceMeters: 2200,
        contact: '+33 1 55 55 0101'
      },
      {
        id: 'par-2',
        name: 'Hôtel de Ville Crypt',
        address: 'Place de l\'Hôtel de Ville, 75004 Paris',
        lat: 48.8565,
        lng: 2.3520,
        capacity: 150,
        occupied: 85,
        status: 'Open',
        distanceMeters: 50,
        contact: '+33 1 55 55 0102'
      }
    ],
    iotSensors: [
      {
        id: 'par-s1',
        name: 'Rue de Rivoli Ingest',
        type: 'Temperature',
        value: 36.8,
        unit: '°C',
        status: 'Active',
        lastUpdated: '1 min ago',
        history: [33.8, 34.9, 35.6, 36.2, 36.6, 36.8]
      },
      {
        id: 'par-s2',
        name: 'Seine Banks Humidity Loop',
        type: 'Humidity',
        value: 34,
        unit: '%',
        status: 'Active',
        lastUpdated: '1 min ago',
        history: [40, 38, 37, 35, 34, 34]
      }
    ],
    historicalTrends: [
      { year: 2017, lst: 34.2, airTemp: 31.2 },
      { year: 2018, lst: 34.4, airTemp: 31.4 },
      { year: 2019, lst: 34.8, airTemp: 31.8 },
      { year: 2020, lst: 35.1, airTemp: 32.1 },
      { year: 2021, lst: 35.0, airTemp: 32.0 },
      { year: 2022, lst: 35.4, airTemp: 32.4 },
      { year: 2023, lst: 35.8, airTemp: 32.8 },
      { year: 2024, lst: 36.2, airTemp: 33.2 },
      { year: 2025, lst: 36.7, airTemp: 33.7 },
      { year: 2026, lst: 37.3, airTemp: 34.3 }
    ]
  }
];

export const MOCK_DISASTER_REPORTS = [
  {
    id: 'dr-1',
    cityId: 'phoenix',
    cityName: 'Phoenix',
    type: 'Heatwave',
    intensity: 'High',
    status: 'Active',
    reportedAt: '2 hours ago',
    details: 'Ambient temperature reached 46°C in residential subdivisions. Urban air-conditioning systems drawing near peak load. High grid failure risk identified in Roosevelt sector.',
    affectedPopulation: 250000,
    neededSupplies: ['Water', 'IV Fluids', 'Battery Backups'],
    activeInterventions: ['Substation Load Shedding', 'Cooling Bus Deployment']
  },
  {
    id: 'dr-2',
    cityId: 'ahmedabad',
    cityName: 'Ahmedabad',
    type: 'Heatwave',
    intensity: 'Severe',
    status: 'Active',
    reportedAt: '4 hours ago',
    details: 'LST of 45.4°C causing high asphalt deformation. Extreme Wet Bulb temperatures presenting immediate heat exhaustion triggers for unorganized labor sectors.',
    affectedPopulation: 450000,
    neededSupplies: ['ORS Satchets', 'Misting Systems', 'Mobile Medical Vans'],
    activeInterventions: ['Labour Work Suspension (12 PM - 4 PM)', 'Public Hydration Stations Active']
  },
  {
    id: 'dr-3',
    cityId: 'paris',
    cityName: 'Paris',
    type: 'Heatwave',
    intensity: 'Medium',
    status: 'Active',
    reportedAt: '6 hours ago',
    details: 'Plan Canicule Phase 3 active. Seine water levels low. Extreme temperatures inside historic zinc-roof buildings with no cooling installations.',
    affectedPopulation: 120000,
    neededSupplies: ['Fans', 'Cooling Pads', 'Emergency Hotlines'],
    activeInterventions: ['Public Parks Kept Open 24h', 'Elderly Well-being Phone Inquiries']
  }
];
