const express = require('express');
const { Product, Category } = require('../models/product');
const { validateProduct, checkContentType } = require('../middleware/validation');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 200, message: 'OK' });
});

// LIST ALL and filter by name, category, availability
router.get('/', async (req, res) => {
  try {
    const where = {};

    if (req.query.name) where.name = req.query.name;

    if (req.query.category) {
      if (!Object.values(Category).includes(req.query.category)) {
        return res.status(400).json({ error: 'Validation Error' });
      }
      where.category = req.query.category;
    }

    if (req.query.available !== undefined) {
      if (!['true', 'false'].includes(req.query.available)) {
        return res.status(400).json({ error: 'Validation Error' });
      }
      where.available = req.query.available === 'true';
    }

    const products = await Product.findAll({ where });
    res.status(200).json(products.map(p => p.serialize()));
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// CREATE
router.post('/', checkContentType('application/json'), validateProduct, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201)
      .location(`/api/products/${product.id}`)
      .json(product.serialize());
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

// READ
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Not Found', message: 'Product not found' });
    }
    res.status(200).json(product.serialize());
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

// UPDATE
router.put('/:id', checkContentType('application/json'), validateProduct, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Not Found', message: 'Product not found' });
    }
    await product.update(req.body);
    res.status(200).json(product.serialize());
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Not Found', message: 'Product not found' });
    }
    await product.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

module.exports = router;
