import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransformRegistry } from './transform.registry';
import { DatabaseModule } from './database/database.module';
import { EtlModule } from './etl/etl.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    EtlModule,
  ],
  controllers: [AppController],
  providers: [AppService, TransformRegistry],
})
export class AppModule {}