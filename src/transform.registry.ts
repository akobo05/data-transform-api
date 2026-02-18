import { Injectable } from '@nestjs/common';
import { TransformStrategy } from './strategies/transform.interface';
import {
  DirectStrategy,
  ConstantStrategy,
  ConditionalStrategy,
  ComputedStrategy
} from './strategies/concrete.strategies';

@Injectable() // Esto permite que NestJS lo use en otros lados
export class TransformRegistry {
  private strategies: Map<string, TransformStrategy> = new Map();

  constructor() {
    // Registramos nuestras herramientas en el mapa
    this.strategies.set('direct', new DirectStrategy());
    this.strategies.set('constant', new ConstantStrategy());
    this.strategies.set('conditional', new ConditionalStrategy());
    this.strategies.set('computed', new ComputedStrategy());
  }

  getStrategy(type: string): TransformStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Strategy ${type} not found`);
    }
    return strategy;
  }
}