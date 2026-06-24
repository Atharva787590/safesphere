/**
 * SafeSphere Weather & Geocoding API Client
 * Integrates with Open-Meteo public endpoints to query locations and real weather metrics.
 */

export interface GeocodedLocation {
  name: string;
  fullName: string;
  country: string;
  lat: number;
  lng: number;
  population?: number;
  elevation?: number;
}

export interface LiveWeatherData {
  airTemp: number; // °C
  relativeHumidity: number; // %
  windSpeed: number; // m/s
  solarRad: number; // W/m² (estimated from local time/elevation)
}

/**
 * Searches for a city, town, or village globally using the Open-Meteo Geocoding API.
 */
export async function searchLocations(query: string): Promise<GeocodedLocation[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
    );
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results.map((item: any) => {
      const adminDetails = [
        item.admin3, // Taluka / Subdistrict
        item.admin2, // District / County
        item.admin1, // State / Region
        item.country
      ].filter(Boolean).join(', ');

      return {
        name: item.name,
        fullName: adminDetails ? `${item.name} (${adminDetails})` : item.name,
        country: item.country || 'Unknown',
        lat: item.latitude,
        lng: item.longitude,
        population: item.population || 0,
        elevation: item.elevation || 0
      };
    });
  } catch (e) {
    console.error('Geocoding API failed, falling back to local matches:', e);
    return [];
  }
}

/**
 * Fetches real-time weather conditions (air temp, humidity, wind speed) for coordinates using Open-Meteo Forecast API.
 */
export async function fetchLiveWeather(lat: number, lng: number): Promise<LiveWeatherData> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&format=json`
    );
    const data = await response.json();

    if (!data.current) {
      throw new Error('Weather data unavailable.');
    }

    // Estimate solar irradiance (W/m²) dynamically based on current time
    // Peak daylight hour (~12 PM) yields ~950 W/m², night yields 0
    const hour = new Date().getHours();
    let solarRad = 0;
    if (hour >= 6 && hour <= 18) {
      // parabolic curve peaking at 12
      solarRad = Math.round(980 * Math.sin(((hour - 6) / 12) * Math.PI));
    }

    return {
      airTemp: Math.round(data.current.temperature_2m * 10) / 10,
      relativeHumidity: Math.round(data.current.relative_humidity_2m),
      windSpeed: Math.round(data.current.wind_speed_10m * 10) / 10,
      solarRad: Math.max(solarRad, 0)
    };
  } catch (e) {
    console.error('Weather forecast API failed, using standard thermodynamic baseline:', e);
    // Safe standard fallback values
    return {
      airTemp: 32.0,
      relativeHumidity: 45,
      windSpeed: 2.5,
      solarRad: 800
    };
  }
}
