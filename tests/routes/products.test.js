const request = require('supertest');
const app = require('../../src/app');
const { Product } = require('../../src/models/product');
const { ProductFactory } = require('../factories');
const BASE_URL = '/api/products';

describe('Product Routes', () => {

  
  /**
   * Utility function to bulk create products
   */
  async function createProducts(count = 1) {
    const products = [];
    for (let i = 0; i < count; i++) {
      const productData = ProductFactory.build();
      const product = await Product.create(productData);
      products.push(product);
    }
    return products;
  }
  
  /**
   * Utility function to get product count
   */
  async function getProductCount() {
    const response = await request(app)
      .get(BASE_URL)
      .expect(200);
    return response.body.length;
  }
  
  describe('Basic Endpoints', () => {
    test('should return the index page', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.text).toContain('Product Catalog Administration');
    });
    
    test('should be healthy', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/health`)
        .expect(200);
      
      expect(response.body.message).toBe('OK');
    });
  });

  
  
  describe('CREATE Product', () => {
    test('should create a new product', async () => {
      const testProduct = ProductFactory.build();

      
      const response = await request(app)
        .post(BASE_URL)
        .send(testProduct)
        .expect(201);
      
      // Make sure location header is set
      expect(response.headers.location).toBeDefined();
      
      // Check the data is correct
      const newProduct = response.body;
      expect(newProduct.name).toBe(testProduct.name);
      expect(newProduct.description).toBe(testProduct.description);
      expect(newProduct.price).toBe(testProduct.price);
      expect(newProduct.available).toBe(testProduct.available);
      expect(newProduct.category).toBe(testProduct.category);
      
      
      
      
    });
    
    test('should not create a product without a name', async () => {
      const productData = ProductFactory.build();
      delete productData.name;
      

      
      const response = await request(app)
        .post(BASE_URL)
        .send(productData)
        .expect(400);
      
      expect(response.body.error).toBe('Validation Error');
    });
    
    test('should not create a product with no Content-Type', async () => {
      await request(app)
        .post(BASE_URL)
        .send('bad data')
        .expect(415);
    });
    
    test('should not create a product with wrong Content-Type', async () => {
      await request(app)
        .post(BASE_URL)
        .set('Content-Type', 'text/plain')
        .send('some plain text data')
        .expect(415);
    });

    test('should proceed if content type is correct but has extra parameters', async () => {
      const productData = ProductFactory.build();
      const response = await request(app)
        .post(BASE_URL)
        .set('Content-Type', 'application/json; charset=utf-8')
        .send(productData);

      // We expect a 201, not a 415, because the base type is correct.
      expect(response.status).toBe(201);
    });
  });


    // Task 3a: READ
  test('should read a product by ID', async () => {
    const [product] = await createProducts(1);

    const response = await request(app)
      .get(`${BASE_URL}/${product.id}`)
      .expect(200);

    expect(response.body.id).toBe(product.id);
    expect(response.body.name).toBe(product.name);
  });

  // Task 3b: UPDATE
  test('should update a product', async () => {
    const [product] = await createProducts(1);
    const updatedData = {
      name: 'Updated Product',
      description: 'Updated description',
      price: 25.50,
      available: false,
      category: 'TOOLS'
    };

    const response = await request(app)
      .put(`${BASE_URL}/${product.id}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.name).toBe(updatedData.name);
    expect(response.body.description).toBe(updatedData.description);
    expect(response.body.available).toBe(false);
  });

  // Task 3c: DELETE
  test('should delete a product', async () => {
    const [product] = await createProducts(1);

    await request(app)
      .delete(`${BASE_URL}/${product.id}`)
      .expect(204);

    await request(app)
      .get(`${BASE_URL}/${product.id}`)
      .expect(404);
  });

  // Task 3d: LIST ALL
  test('should list all products', async () => {
    await createProducts(3);

    const response = await request(app)
      .get(BASE_URL)
      .expect(200);

    expect(response.body).toHaveLength(3);
  });

  // Task 3e: LIST BY NAME
  test('should list products by name', async () => {
    await createProducts(1);
    const target = ProductFactory.build({ name: 'Fedora' });
    delete target.id;
    await Product.create(target);

    const response = await request(app)
      .get(`${BASE_URL}?name=Fedora`)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body.every(product => product.name === 'Fedora')).toBe(true);
  });

  // Task 3f: LIST BY CATEGORY
  test('should list products by category', async () => {
    const target = ProductFactory.build({ category: 'FOOD' });
    delete target.id;
    await Product.create(target);

    const response = await request(app)
      .get(`${BASE_URL}?category=FOOD`)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body.every(product => product.category === 'FOOD')).toBe(true);
  });

  // Task 3g: LIST BY AVAILABILITY
  test('should list products by availability', async () => {
    const target = ProductFactory.build({ available: false });
    delete target.id;
    await Product.create(target);

    const response = await request(app)
      .get(`${BASE_URL}?available=false`)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body.every(product => product.available === false)).toBe(true);
  });  
  
});
