
const { Given } = require('@cucumber/cucumber');
const axios = require('axios');

const API_URL = 'http://localhost:8080/api/products';

Given('the following products', async function (dataTable) {
  // Clear existing products
  const response = await axios.get(API_URL);

  for (const product of response.data) {
    await axios.delete(`${API_URL}/${product.id}`);
  }

  // Load the products from the feature file
  const products = dataTable.hashes();

  for (const product of products) {
    await axios.post(API_URL, {
      name: product.name,
      description: product.description,
      price: Number(product.price),
      available: product.available.toLowerCase() === 'true',
      category: product.category
    });
  }
});

