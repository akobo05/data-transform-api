import { Module } from '@nestjs/common';
import { EtlService } from './etl.service';
import { TextTransformRegistry } from './text-transform.registry';
import { TransformRegistry } from '../transform.registry';

@Module({
  providers: [EtlService, TextTransformRegistry, TransformRegistry],
  exports: [EtlService],
})
export class EtlModule {}
