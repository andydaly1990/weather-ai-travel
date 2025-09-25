import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgForOf } from '@angular/common';
import * as L from 'leaflet';
import { WeatherService, WeatherDTO } from '../../../../core/services/weather.service';
import { AiService } from '../../../../core/services/ai.service';
import { firstValueFrom } from 'rxjs';

type PageState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf],
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent implements AfterViewInit {
  city = '';
  weather?: WeatherDTO;
  tips: string[] = [];
  state: PageState = 'idle';
  errorMsg: string | null = null;

  private map?: L.Map;
  private marker?: L.Marker; // keep a single marker instance

  constructor(private weatherSvc: WeatherService, private aiSvc: AiService) {}

  ngAfterViewInit() {
    this.map = L.map('map').setView([51.5, -0.09], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(this.map);

    // default Leaflet marker icons from /assets
    const DefaultIcon = L.icon({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }

  async onSearch() {
    // reset UI
    this.errorMsg = null;
    this.tips = [];
    this.weather = undefined;
    this.state = 'loading';

    try {
      if (!this.city?.trim()) {
        throw new Error('Please enter a city.');
      }

      // WEATHER
      const w = await firstValueFrom(this.weatherSvc.getCityWeather(this.city));
      if (!w) throw new Error('Weather service returned nothing.');
      this.weather = w;

      // MAP (reuse a single marker)
      if (this.map) {
        this.map.setView([w.lat, w.lon], 11);
        if (this.marker) {
          this.marker.setLatLng([w.lat, w.lon]);
        } else {
          this.marker = L.marker([w.lat, w.lon]).addTo(this.map);
        }
      }

      // AI TIPS (only after weather succeeds)
      const tips = await firstValueFrom(this.aiSvc.suggest(this.city, { temp: w.temp, summary: w.summary }));
      this.tips = tips ?? [];

      this.state = 'success';
    } catch (err: any) {
      console.error(err);
      // show backend message when available; otherwise a friendly default
      this.errorMsg = err?.error?.message || err?.message || 'Could not fetch weather or AI tips. Please try again.';
      this.state = 'error';
    }
  }
}
