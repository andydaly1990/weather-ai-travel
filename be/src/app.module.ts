import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeatherController } from './weather/weather.controller';
import { AiController } from './ai/ai.controller';

@Module({
  imports: [],
  controllers: [AppController, WeatherController, AiController],
  providers: [AppService],
})
export class AppModule {}
