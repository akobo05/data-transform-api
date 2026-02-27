import { Controller, HttpCode, InternalServerErrorException, Logger, Post } from '@nestjs/common';
import { EtlService } from './etl.service';

@Controller('etl')
export class EtlController {
  private readonly logger = new Logger(EtlController.name);

  constructor(private readonly etlService: EtlService) {}

  @Post('run-migration')
  @HttpCode(200)
  async runMigration() {
    try {
      return await this.etlService.runFullMigration();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Migration failed: ${message}`);
      throw new InternalServerErrorException(`Migration failed: ${message}`);
    }
  }
}
