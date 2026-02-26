import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('transform')
  transform(@Body() payload: any) {
    return this.appService.transformData(payload);
  }
}