import { DecimalColumnTransformer } from './DecimalColumnTransformer';

describe('DecimalColumnTransformer', () => {
  let transformer: DecimalColumnTransformer;

  beforeEach(() => {
    transformer = new DecimalColumnTransformer();
  });

  describe('to', () => {
    it('should format number to 2 decimal places', () => {
      expect(transformer.to(100)).toBe('100.00');
      expect(transformer.to(100.5)).toBe('100.50');
      expect(transformer.to(100.55)).toBe('100.55');
      expect(transformer.to(100.555)).toBe('100.56');
      expect(transformer.to(0)).toBe('0.00');
    });
  });

  describe('from', () => {
    it('should parse string to number with 2 decimal places', () => {
      expect(transformer.from('100')).toBe(100.0);
      expect(transformer.from('100.5')).toBe(100.5);
      expect(transformer.from('100.55')).toBe(100.55);
      expect(transformer.from('100.555')).toBe(100.56);
      expect(transformer.from('0')).toBe(0.0);
    });

    it('should handle string numbers with more than 2 decimal places', () => {
      expect(transformer.from('100.123')).toBe(100.12);
      expect(transformer.from('100.567')).toBe(100.57);
      expect(transformer.from('100.999')).toBe(101.0);
    });
  });
});
