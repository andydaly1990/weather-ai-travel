/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import axios from 'axios';

// Define the shape of the response this endpoint will return
type WeatherResult = {
  temp: number;    // A fake temperature (hardcoded for now)
  summary: string; // A fake weather summary (hardcoded for now)
  lat: number;     // Latitude of the requested city
  lon: number;     // Longitude of the requested city
};

// This controller will handle requests to routes starting with /weather
@Controller('weather')
export class WeatherController {

  // Handles GET /weather requests
  // Example: /weather?city=Paris
  @Get()
  async get(@Query('city') city?: string): Promise<WeatherResult> {

    // 1) Validate the query parameter
    // If no city is provided, or if it's just empty spaces → return HTTP 400
    if (!city || !city.trim()) {
      throw new BadRequestException('Query parameter "city" is required.');
    }

    // 2) Use the OpenStreetMap Nominatim API to convert the city into lat/lon
    //    - q = city name
    //    - format=json (return JSON)
    //    - limit=1 (only one result)
    const geoResp = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: city, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'weather-ai-travel-app (dev)' }, // polite to include UA
      timeout: 10_000, // 10 second timeout
      validateStatus: (s) => s >= 200 && s < 500, // treat 4xx responses as "handled"
    });

    // 3) If no location was found, return a harmless fake fallback
    if (!Array.isArray(geoResp.data) || geoResp.data.length === 0) {
      return { temp: 20, summary: 'Clear', lat: 51.5, lon: -0.09 };
    }

    // Extract latitude/longitude from the geocoding result
    const { lat, lon } = geoResp.data[0];

    // 4) Return a simple "weather result" object
    // Currently the weather values are hardcoded — only lat/lon are real
    return { temp: 20, summary: 'Clear', lat: Number(lat), lon: Number(lon) };
  }
}
