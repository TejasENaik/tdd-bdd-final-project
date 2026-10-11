const { faker } = require('@faker-js/faker');
const { Category } = require('../src/models/product');

class ProductFactory {
  static build(overrides = {}) {
    return {
      id: faker.number.int({ min: 1, max: 100000 }),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription().slice(0, 250),
      price: Number(faker.commerce.price({ min: 1, max: 1000, dec: 2 })),
      available: faker.datatype.boolean(),
      category: faker.helpers.arrayElement(Object.values(Category)),
      ...overrides
    };
  }
}

module.exports = { ProductFactory };
