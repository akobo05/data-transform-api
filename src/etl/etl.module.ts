import { Module } from '@nestjs/common';
import { EtlController } from './etl.controller';
import { EtlService } from './etl.service';
import { TransformRegistry } from '../transform.registry';

@Module({
  controllers: [EtlController],
  providers: [EtlService, TransformRegistry],
  exports: [EtlService],
})
export class EtlModule {}
