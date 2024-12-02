import { Product } from './product.entity';

describe('Product', () => {
  let product: Product;

  beforeEach(() => {
    product = new Product();
  });

  describe('price', () => {
    it('should store price with exactly 2 decimal places', () => {
      product.price = 100;
      expect(product.price.toFixed(2).toString()).toBe('100.00');

      product.price = 100.5;
      expect(product.price.toFixed(2).toString()).toBe('100.50');

      product.price = 100.55;
      expect(product.price.toFixed(2).toString()).toBe('100.55');

      product.price = 100.555;
      expect(product.price.toFixed(2).toString()).toBe('100.56');
    });
  });
});
