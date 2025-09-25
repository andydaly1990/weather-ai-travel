/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export type WeatherDTO = {
  temp: number;       // Celsius
  summary: string;    // e.g., "Clear", "Rain"
  lat: number;
  lon: number;
};

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly base = '/api'; // dev proxy → Nest at http://localhost:3000

  constructor(private http: HttpClient) {}

  getCityWeather(city: string) {
    // Encodes the city safely and calls your Nest endpoint
    return this.http.get<WeatherDTO>(
      `${this.base}/weather?city=${encodeURIComponent(city)}`
    );
  }
}
