import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import type { TransformPayload } from './strategies/transform.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('transform')
  transform(@Body() payload: TransformPayload) {
    return this.appService.transformData(payload);
  }
}
