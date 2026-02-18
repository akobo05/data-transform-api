import { Injectable } from '@nestjs/common';
import { TransformRegistry } from './transform.registry';

@Injectable()
export class AppService {
  constructor(private readonly registry: TransformRegistry) {}

  transformData(payload: any) {
    // Verificamos que payload y records existan para evitar errores si envían basura
    if (!payload || !payload.records || !payload.rules) {
      return { error: 'Invalid payload structure' };
    }

    const { records, rules } = payload;
    const mappings = rules.mappings || [];

    const results = records.map((record: any) => {
      const transformedData: any = {};

      // SOLUCIÓN: Agregamos ': any[]' para que TypeScript sepa que es una lista
      const errors: any[] = [];

      for (const rule of mappings) {
        try {
          const strategy = this.registry.getStrategy(rule.type);

          if (strategy) {
            const value = strategy.apply(rule, record);
            if (value !== undefined) {
              transformedData[rule.target] = value;
            }
          }
        } catch (error: any) {
          errors.push({
            field: rule.target,
            message: error.message
          });
        }
      }

      // Estructura de respuesta según el test
      const resultObj: any = {
        success: errors.length === 0,
        data: transformedData
      };

      // Solo agregamos el campo errors si hubo alguno
      if (errors.length > 0) {
        resultObj.errors = errors;
      }

      return resultObj;
    });

    return { results };
  }
}