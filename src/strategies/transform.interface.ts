export type PrimitiveValue = string | number | boolean | null;

export interface TransformationRule {
  type: 'direct' | 'constant' | 'conditional' | 'computed';
  target: string;
  source?: string;
  value?: PrimitiveValue;
  condition?: {
    field: string;
    operator: 'eq' | 'neq';
    value: PrimitiveValue;
    then: PrimitiveValue;
  };
  params?: string[];
  separator?: string;
}

export interface TransformStrategy {
  apply(rule: TransformationRule, record: Record<string, unknown>): PrimitiveValue | undefined;
}

export interface TransformError {
  field: string;
  message: string;
}

export interface TransformRecordResult {
  success: boolean;
  data: Record<string, PrimitiveValue>;
  errors?: TransformError[];
}

export interface TransformPayload {
  records: Record<string, unknown>[];
  rules: {
    mappings: TransformationRule[];
  };
}
