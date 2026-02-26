import { Body, Controller, HttpCode, InternalServerErrorException, Logger, Post } from '@nestjs/common';
import { EtlService } from './etl.service';

@Controller('etl')
export class EtlController {
  private readonly logger = new Logger(EtlController.name);

  constructor(private readonly etlService: EtlService) {}

  @Post('run-migration')
  @HttpCode(200)
  async runMigration(@Body() body: { strategy?: string }) {
    try {
      return await this.etlService.runFullMigration(body?.strategy);
    } catch (error) {
      this.logger.error(`Migration failed: ${error.message}`);
      throw new InternalServerErrorException(`Migration failed: ${error.message}`);
    }
  }
}
