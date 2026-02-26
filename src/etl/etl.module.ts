import { Module } from '@nestjs/common';
import { EtlController } from './etl.controller';
import { EtlService } from './etl.service';
import { TextTransformRegistry } from './text-transform.registry';
import { TransformRegistry } from '../transform.registry';

@Module({
  controllers: [EtlController],
  providers: [EtlService, TextTransformRegistry, TransformRegistry],
  exports: [EtlService],
})
export class EtlModule {}
