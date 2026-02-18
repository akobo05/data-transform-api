import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('transform')
  transform(@Body() payload: any) {
    // Aquí estaba el error: llamaba a getHello() en vez de transformData()
    return this.appService.transformData(payload);
  }
}