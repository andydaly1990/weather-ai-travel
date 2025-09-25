/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/require-await */
import { Body, Controller, Post, BadRequestException } from '@nestjs/common';

type SuggestBody = {
  city?: string;
  weather?: { temp?: number; summary?: string };
};

@Controller('ai')
export class AiController {
  @Post('suggest')
  async suggest(@Body() body: SuggestBody) {
    // 1) Validate input
    if (!body || !body.city || !body.weather) {
      throw new BadRequestException('Body must include { city, weather }.');
    }
    const { city, weather } = body;
    const temp = Number(weather.temp ?? NaN);
    const summary = (weather.summary ?? '').toString().toLowerCase();

    // 2) Simple rule-based suggestions (placeholder for real AI later)
    const tips: string[] = [];

    if (Number.isFinite(temp) && summary.includes('clear') && temp >= 18) {
      tips.push(`It's nice in ${city}. Consider a walking tour or a park picnic.`);
    } else if (summary.includes('rain')) {
      tips.push(`Rain in ${city}. Try a museum, gallery, or a cozy café.`);
    } else if (Number.isFinite(temp) && temp <= 5) {
      tips.push(`Chilly in ${city}. Opt for indoor attractions or a hearty food market.`);
    } else {
      tips.push(`Mixed weather in ${city}. Have a plan B: indoor attraction or food market.`);
    }

    // 3) Return a short list of ideas
    return tips;
  }
}
