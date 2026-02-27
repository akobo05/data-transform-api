import { PrimitiveValue, TransformStrategy, TransformationRule } from './transform.interface';

// 1. Direct: Copia tal cual (ej: name -> full_name)
export class DirectStrategy implements TransformStrategy {
  apply(rule: TransformationRule, record: Record<string, unknown>): PrimitiveValue | undefined {
    if (!rule.source) throw new Error('Missing source field for direct strategy');
    const value = record[rule.source];
    return value !== undefined && value !== null ? (value as PrimitiveValue) : undefined;
  }
}

// 2. Constant: Pone un valor fijo siempre
export class ConstantStrategy implements TransformStrategy {
  apply(rule: TransformationRule, _record: Record<string, unknown>): PrimitiveValue | undefined {
    if (rule.value === undefined) throw new Error('Missing value for constant strategy');
    return rule.value;
  }
}

// 3. Conditional: Si pasa X, entonces pon Y
export class ConditionalStrategy implements TransformStrategy {
  apply(rule: TransformationRule, record: Record<string, unknown>): PrimitiveValue | undefined {
    const { condition } = rule;
    if (!condition) throw new Error('Missing condition config');

    const recordValue = record[condition.field];

    if (condition.operator === 'eq' && recordValue === condition.value) {
      return condition.then;
    }
    return undefined;
  }
}

// 4. Computed: Junta varios campos (ej: Nombre + Apellido)
export class ComputedStrategy implements TransformStrategy {
  apply(rule: TransformationRule, record: Record<string, unknown>): PrimitiveValue | undefined {
    if (!rule.params) throw new Error('Missing params for computed strategy');

    const values = rule.params.map(field => {
      const val = record[field];
      return val !== undefined && val !== null ? String(val) : '';
    });
    return values.join(rule.separator ?? ' ');
  }
}

// 5. Lookup: Mapea un valor a otro usando un diccionario (ej: M -> Male, ACTIVO -> active)
export class LookupStrategy implements TransformStrategy {
  apply(rule: TransformationRule, record: Record<string, unknown>): PrimitiveValue | undefined {
    if (!rule.source) throw new Error('Missing source field for lookup strategy');
    if (!rule.map) throw new Error('Missing map for lookup strategy');
    const raw = record[rule.source];
    if (raw === undefined || raw === null) return undefined;
    const key = String(raw);
    return key in rule.map ? rule.map[key] : undefined;
  }
}
