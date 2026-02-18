import { TransformStrategy, TransformationRule } from './transform.interface';

// 1. Direct: Copia tal cual (ej: name -> full_name)
export class DirectStrategy implements TransformStrategy {
  apply(rule: TransformationRule, record: any): any {
    if (!rule.source) throw new Error('Missing source field for direct strategy');
    return record[rule.source];
  }
}

// 2. Constant: Pone un valor fijo siempre
export class ConstantStrategy implements TransformStrategy {
  apply(rule: TransformationRule, record: any): any {
    if (rule.value === undefined) throw new Error('Missing value for constant strategy');
    return rule.value;
  }
}

// 3. Conditional: Si pasa X, entonces pon Y
export class ConditionalStrategy implements TransformStrategy {
  apply(rule: TransformationRule, record: any): any {
    const { condition } = rule;
    if (!condition) throw new Error('Missing condition config');

    const recordValue = record[condition.field];

    // Logica simple de comparación (puedes agregar más operadores)
    if (condition.operator === 'eq' && recordValue === condition.value) {
      return condition.then;
    }
    // Si no se cumple, retornamos null o undefined (el campo no se crea)
    return undefined;
  }
}

// 4. Computed: Junta varios campos (ej: Nombre + Apellido)
export class ComputedStrategy implements TransformStrategy {
  apply(rule: TransformationRule, record: any): any {
    if (!rule.params) throw new Error('Missing params for computed strategy');

    // Obtiene los valores de los campos pedidos
    const values = rule.params.map(field => record[field] || '');
    // Los une con un espacio (o lo que diga el separador)
    return values.join(rule.separator || ' ');
  }
}