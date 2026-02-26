import { Injectable } from '@nestjs/common';

export interface TextStrategy {
  transform(text: string): string;
}

class UppercaseStrategy implements TextStrategy {
  transform(text: string): string {
    return text.toUpperCase();
  }
}

class LowercaseStrategy implements TextStrategy {
  transform(text: string): string {
    return text.toLowerCase();
  }
}

class TrimStrategy implements TextStrategy {
  transform(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }
}

class NormalizeStrategy implements TextStrategy {
  transform(text: string): string {
    return text.replace(/\s+/g, ' ').trim().toLowerCase();
  }
}

@Injectable()
export class TextTransformRegistry {
  private strategies: Map<string, TextStrategy> = new Map();

  constructor() {
    this.strategies.set('uppercase', new UppercaseStrategy());
    this.strategies.set('lowercase', new LowercaseStrategy());
    this.strategies.set('trim', new TrimStrategy());
    this.strategies.set('normalize', new NormalizeStrategy());
  }

  getStrategy(name: string): TextStrategy | null {
    return this.strategies.get(name) ?? null;
  }

  getStrategyNames(): string[] {
    return Array.from(this.strategies.keys());
  }
}
