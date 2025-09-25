import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgForOf } from '@angular/common'; // use NgForOf explicitly
import * as L from 'leaflet';
import { WeatherService, WeatherDTO } from '../../../../core/services/weather.service';
import { AiService } from '../../../../core/services/ai.service';

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
  error = '';
  private map?: L.Map;

  constructor(private weatherSvc: WeatherService, private aiSvc: AiService) {}

  ngAfterViewInit() {
    this.map = L.map('map').setView([51.5, -0.09], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(this.map);

    // inline marker icon config (no extra import needed)
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
    this.error = '';
    this.tips = [];
    this.weather = undefined;

    try {
      const w = await this.weatherSvc.getCityWeather(this.city).toPromise();

      if (!w) {
        throw new Error('Weather service returned nothing');
      }

      this.weather = w;

      if (this.map) {
        this.map.setView([w.lat, w.lon], 11);
        L.marker([w.lat, w.lon]).addTo(this.map);
      }

      const tips = await this.aiSvc
        .suggest(this.city, { temp: w.temp, summary: w.summary })
        .toPromise();

      this.tips = tips ?? []; // fallback to [] if backend returns undefined
    } catch (err) {
      console.error(err);
      this.error = 'Could not fetch weather or AI tips. Please try again.';
    }
  }
}
