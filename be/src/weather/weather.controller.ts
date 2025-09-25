/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { BadRequestException, Controller, Get, InternalServerErrorException, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

type WeatherResultDto = { temp: number; summary: string; lat: number; lon: number };

type CacheKey = `${number},${number}`;
const cache = new Map<CacheKey, { data: WeatherResultDto; expires: number }>();
const TTL_MS = 5 * 60 * 1000;

@Controller('weather')
export class WeatherController {
  constructor(private readonly config: ConfigService) {}

  private async geocode(city: string): Promise<{ lat: number; lon: number }> {
    if (!city?.trim()) throw new BadRequestException('city is required');
    const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: city, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'weather-ai-travel-dev' },
      timeout: 10_000,
    });
    if (!Array.isArray(data) || !data[0]) throw new BadRequestException(`Could not geocode "${city}"`);
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  }

  private kToC(k: number) { return Math.round((k - 273.15) * 10) / 10 }

  private mapOpenWeatherToSummary(code: number): string {
    if (code >= 200 && code < 300) return 'Thunderstorm';
    if (code >= 300 && code < 600) return 'Rain';
    if (code >= 600 && code < 700) return 'Snow';
    if (code === 800) return 'Clear';
    if (code > 800) return 'Clouds';
    return 'Unknown';
  }

  @Get()
  async get(@Query('city') city: string): Promise<WeatherResultDto> {
    const { lat, lon } = await this.geocode(city);

    const key: CacheKey = `${lat},${lon}`;
    const now = Date.now();
    const hit = cache.get(key);
    if (hit && hit.expires > now) return hit.data;
  

    const apiKey = this.config.get<string>('OPENWEATHER_API_KEY');
    console.log('OPENWEATHER_API_KEY present?', Boolean(apiKey), apiKey?.slice(0, 4) + '****');
    const baseUrl = this.config.get<string>('OPENWEATHER_BASE_URL') || 'https://api.openweathermap.org/data/2.5/weather';
    if (!apiKey) throw new InternalServerErrorException('Weather API key not configured');

    try {
      const { data } = await axios.get(baseUrl, { params: { lat, lon, appid: apiKey }, timeout: 10_000 });
      const temp = this.kToC(data?.main?.temp);
      const code = data?.weather?.[0]?.id ?? 800;
      const summary = this.mapOpenWeatherToSummary(code);
      if (Number.isNaN(temp)) throw new Error('Invalid temperature from provider');

      const result: WeatherResultDto = { temp, summary, lat, lon };
      cache.set(key, { data: result, expires: now + TTL_MS });
      return result;
    } catch {
      throw new InternalServerErrorException('Failed to fetch weather data');
    }
  }
}
