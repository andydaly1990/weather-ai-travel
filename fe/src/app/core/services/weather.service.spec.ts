// This test uses Angular's HttpClientTestingModule to intercept HTTP calls
// so no real network requests are made.
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let svc: WeatherService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // provides a mock HttpClient
    });
    svc = TestBed.inject(WeatherService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // verifies that there are no outstanding HTTP requests
    http.verify();
  });

  it('calls /api/weather and returns the DTO (happy path)', () => {
    // 1) Arrange: subscribe to the service
    const city = 'Dublin';
    let result: any;

    svc.getCityWeather(city).subscribe((data) => (result = data));

    // 2) Act: expect a GET to the right URL and flush mock data
    const req = http.expectOne(`/api/weather?city=${city}`);
    expect(req.request.method).toBe('GET');

    // mock backend payload
    req.flush({ temp: 13, summary: 'Clouds', lat: 53.349, lon: -6.26 });

    // 3) Assert: the service exposes the data as-is
    expect(result).toEqual({
      temp: 13,
      summary: 'Clouds',
      lat: 53.349,
      lon: -6.26,
    });
  });

  it('propagates backend errors', () => {
    const city = 'NoWhereLand';
    let error: any;

    svc.getCityWeather(city).subscribe({
      next: () => {},
      error: (e) => (error = e),
    });

    const req = http.expectOne(`/api/weather?city=${city}`);
    req.flush({ message: 'Could not geocode "NoWhereLand"' }, { status: 400, statusText: 'Bad Request' });

    // We just check an error exists; UI will format the message.
    expect(error).toBeTruthy();
  });
});
