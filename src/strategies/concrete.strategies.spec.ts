import {
  DirectStrategy,
  ConstantStrategy,
  ConditionalStrategy,
  ComputedStrategy
} from './concrete.strategies';

describe('Strategies', () => {
  let direct: DirectStrategy;
  let constant: ConstantStrategy;
  let conditional: ConditionalStrategy;
  let computed: ComputedStrategy;

  // Antes de cada test, reiniciamos las estrategias
  beforeEach(() => {
    direct = new DirectStrategy();
    constant = new ConstantStrategy();
    conditional = new ConditionalStrategy();
    computed = new ComputedStrategy();
  });

  // 1. Test para Direct Strategy
  describe('DirectStrategy', () => {
    it('debe copiar el valor de un campo', () => {
      const record = { nombre: 'Aaron' };
      const rule = { type: 'direct', source: 'nombre', target: 'name' } as any;
      expect(direct.apply(rule, record)).toBe('Aaron');
    });
  });

  // 2. Test para Constant Strategy
  describe('ConstantStrategy', () => {
    it('debe devolver siempre el mismo valor', () => {
      const rule = { type: 'constant', value: 'v1', target: 'version' } as any;
      expect(constant.apply(rule, {})).toBe('v1');
    });
  });

  // 3. Test para Computed Strategy
  describe('ComputedStrategy', () => {
    it('debe unir campos con un separador', () => {
      const record = { nombre: 'Juan', apellido: 'Perez' };
      const rule = {
        type: 'computed',
        params: ['nombre', 'apellido'],
        separator: ' ',
        target: 'full_name'
      } as any;
      expect(computed.apply(rule, record)).toBe('Juan Perez');
    });
  });

  // 4. Test para Conditional Strategy
  describe('ConditionalStrategy', () => {
    it('debe devolver valor si la condicion se cumple', () => {
      const record = { status: 'active' };
      const rule = {
        type: 'conditional',
        condition: { field: 'status', operator: 'eq', value: 'active', then: true },
        target: 'isActive'
      } as any;
      expect(conditional.apply(rule, record)).toBe(true);
    });

    it('debe devolver undefined si la condicion NO se cumple', () => {
      const record = { status: 'inactive' };
      const rule = {
        type: 'conditional',
        condition: { field: 'status', operator: 'eq', value: 'active', then: true },
        target: 'isActive'
      } as any;
      expect(conditional.apply(rule, record)).toBeUndefined();
    });
  });
});