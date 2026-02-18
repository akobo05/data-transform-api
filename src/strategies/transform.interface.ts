// Definimos la estructura que tendrá una "Regla" en el JSON
export interface TransformationRule {
  type: 'direct' | 'constant' | 'conditional' | 'computed';
  target: string;       // El nombre del campo final
  source?: string;      // Para 'direct': de qué campo sacar el valor
  value?: any;          // Para 'constant': qué valor fijo poner
  // Para 'conditional':
  condition?: { field: string; operator: 'eq' | 'neq'; value: any; then: any };
  // Para 'computed':
  params?: string[];    // Qué campos unir
  separator?: string;   // Con qué unirlos (ej: espacio)
}

// El "contrato" (Interface) que todas las estrategias deben seguir
export interface TransformStrategy {
  apply(rule: TransformationRule, record: any): any;
}