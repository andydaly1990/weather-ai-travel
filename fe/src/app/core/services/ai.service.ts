/* eslint-disable @angular-eslint/prefer-inject */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { WeatherDTO } from './weather.service';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly base = '/api';

  constructor(private http: HttpClient) {}

  suggest(city: string, weather: Pick<WeatherDTO, 'temp' | 'summary'>) {
    // Posts to Nest AI endpoint and expects an array of suggestion strings
    return this.http.post<string[]>(
      `${this.base}/ai/suggest`,
      { city, weather }
    );
  }
}
