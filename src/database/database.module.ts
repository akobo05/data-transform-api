import { Global, Module } from '@nestjs/common';
import { SourcePrismaService } from './source-prisma.service';
import { TargetPrismaService } from './target-prisma.service';

@Global()
@Module({
  providers: [SourcePrismaService, TargetPrismaService],
  exports: [SourcePrismaService, TargetPrismaService],
})
export class DatabaseModule {}
