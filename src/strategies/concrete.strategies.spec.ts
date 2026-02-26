import {
  DirectStrategy,
  ConstantStrategy,
  ConditionalStrategy,
  ComputedStrategy
} from './concrete.strategies';
import { TransformationRule } from './transform.interface';

describe('Strategies', () => {
  let direct: DirectStrategy;
  let constant: ConstantStrategy;
  let conditional: ConditionalStrategy;
  let computed: ComputedStrategy;

  beforeEach(() => {
    direct = new DirectStrategy();
    constant = new ConstantStrategy();
    conditional = new ConditionalStrategy();
    computed = new ComputedStrategy();
  });

  describe('DirectStrategy', () => {
    it('debe copiar el valor de un campo', () => {
      const record = { nombre: 'Aaron' };
      const rule: TransformationRule = { type: 'direct', source: 'nombre', target: 'name' };
      expect(direct.apply(rule, record)).toBe('Aaron');
    });
  });

  describe('ConstantStrategy', () => {
    it('debe devolver siempre el mismo valor', () => {
      const rule: TransformationRule = { type: 'constant', value: 'v1', target: 'version' };
      expect(constant.apply(rule, {})).toBe('v1');
    });
  });

  describe('ComputedStrategy', () => {
    it('debe unir campos con un separador', () => {
      const record = { nombre: 'Juan', apellido: 'Perez' };
      const rule: TransformationRule = {
        type: 'computed',
        params: ['nombre', 'apellido'],
        separator: ' ',
        target: 'full_name',
      };
      expect(computed.apply(rule, record)).toBe('Juan Perez');
    });
  });

  describe('ConditionalStrategy', () => {
    it('debe devolver valor si la condicion se cumple', () => {
      const record = { status: 'active' };
      const rule: TransformationRule = {
        type: 'conditional',
        condition: { field: 'status', operator: 'eq', value: 'active', then: true },
        target: 'isActive',
      };
      expect(conditional.apply(rule, record)).toBe(true);
    });

    it('debe devolver undefined si la condicion NO se cumple', () => {
      const record = { status: 'inactive' };
      const rule: TransformationRule = {
        type: 'conditional',
        condition: { field: 'status', operator: 'eq', value: 'active', then: true },
        target: 'isActive',
      };
      expect(conditional.apply(rule, record)).toBeUndefined();
    });
  });
});
