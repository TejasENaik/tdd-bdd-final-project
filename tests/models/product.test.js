const { Product, Category } = require('../../src/models/product');
const { ProductFactory } = require('../factories');

describe('Product Model', () => {
  const createProduct = async (overrides = {}) => {
    const data = ProductFactory.build(overrides);
    delete data.id;
    return await Product.create(data);
  };

  describe('Product Creation', () => {
    test('should create a product and assert that it exists', () => {
      const product = new Product({
        name: 'Fedora',
        description: 'A red hat',
        price: 12.50,
        available: true,
        category: Category.CLOTHS
      });

      expect(product).toBeDefined();
      expect(product.id).toBeNull();
      expect(product.name).toBe('Fedora');
      expect(product.description).toBe('A red hat');
      expect(product.available).toBe(true);
      expect(product.price).toBe(12.50);
      expect(product.category).toBe(Category.CLOTHS);
    });

    test('should add a product to the database', async () => {
      const product = await createProduct({ name: 'Fedora' });

      expect(product.id).toBeDefined();

      const found = await Product.findByPk(product.id);
      expect(found.name).toBe('Fedora');
    });
  });

  // Task 2a: READ
  test('should read a product by ID', async () => {
    const product = await createProduct({ name: 'Read Product' });

    const found = await Product.findByPk(product.id);

    expect(found).not.toBeNull();
    expect(found.name).toBe('Read Product');
  });

  // Task 2b: UPDATE
  test('should update a product', async () => {
    const product = await createProduct({ name: 'Old Name' });

    await product.update({ name: 'Updated Name', price: 25.50 });

    const updated = await Product.findByPk(product.id);
    expect(updated.name).toBe('Updated Name');
    expect(parseFloat(updated.price)).toBe(25.50);
  });

  // Task 2c: DELETE
  test('should delete a product', async () => {
    const product = await createProduct();

    await product.destroy();

    const found = await Product.findByPk(product.id);
    expect(found).toBeNull();
  });

  // Task 2d: LIST ALL
  test('should list all products', async () => {
    await createProduct({ name: 'Product One' });
    await createProduct({ name: 'Product Two' });

    const products = await Product.findAll();

    expect(products).toHaveLength(2);
  });

  // Task 2e: FIND BY NAME
  test('should find products by name', async () => {
    await createProduct({ name: 'Fedora' });
    await createProduct({ name: 'Boots' });

    const products = await Product.findByName('Fedora');

    expect(products).toHaveLength(1);
    expect(products[0].name).toBe('Fedora');
  });

  // Task 2f: FIND BY CATEGORY
  test('should find products by category', async () => {
    await createProduct({ category: Category.FOOD });
    await createProduct({ category: Category.TOOLS });

    const products = await Product.findByCategory(Category.FOOD);

    expect(products).toHaveLength(1);
    expect(products[0].category).toBe(Category.FOOD);
  });

  // Task 2g: FIND BY AVAILABILITY
  test('should find products by availability', async () => {
    await createProduct({ available: true });
    await createProduct({ available: false });

    const products = await Product.findByAvailability(false);

    expect(products).toHaveLength(1);
    expect(products[0].available).toBe(false);
  });
});
