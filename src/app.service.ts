import { Injectable } from '@nestjs/common';
import {
  TransformError,
  TransformPayload,
  TransformRecordResult,
  PrimitiveValue,
} from './strategies/transform.interface';
import { TransformRegistry } from './transform.registry';

@Injectable()
export class AppService {
  constructor(private readonly registry: TransformRegistry) {}

  transformData(payload: TransformPayload): { results: TransformRecordResult[] } | { error: string } {
    if (!payload || !payload.records || !payload.rules) {
      return { error: 'Invalid payload structure' };
    }

    const { records, rules } = payload;
    const mappings = rules.mappings || [];

    const results = records.map((record) => {
      const transformedData: Record<string, PrimitiveValue> = {};
      const errors: TransformError[] = [];

      for (const rule of mappings) {
        try {
          const strategy = this.registry.getStrategy(rule.type);

          if (strategy) {
            const value = strategy.apply(rule, record);
            if (value !== undefined) {
              transformedData[rule.target] = value;
            }
          }
        } catch (error: unknown) {
          errors.push({
            field: rule.target,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const resultObj: TransformRecordResult = {
        success: errors.length === 0,
        data: transformedData,
      };

      if (errors.length > 0) {
        resultObj.errors = errors;
      }

      return resultObj;
    });

    return { results };
  }
}
