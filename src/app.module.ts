import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransformRegistry } from './transform.registry'; // Importante

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    TransformRegistry // ¡Aquí registramos nuestra clase para que funcione la inyección!
  ],
})
export class AppModule {}