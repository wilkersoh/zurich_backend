import { Product } from './product.entity';

describe('Product Entity', () => {
  let product: Product;

  beforeEach(() => {
    product = new Product();
  });

  describe('price', () => {
    it('should store price with exactly 2 decimal places', () => {
      // Test whole numbers
      product.price = 100;
      expect(product.price.toString()).toBe('100.00');

      // Test one decimal place
      product.price = 100.5;
      expect(product.price.toString()).toBe('100.50');

      // Test two decimal places
      product.price = 100.55;
      expect(product.price.toString()).toBe('100.55');

      // Test rounding
      product.price = 100.555;
      expect(product.price.toString()).toBe('100.56');

      // Test zero
      product.price = 0;
      expect(product.price.toString()).toBe('0.00');
    });
  });
});
