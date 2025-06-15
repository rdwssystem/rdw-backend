/**
 * Simple backend server for RDW Sound System catalog
 * 
 * Features:
 * - REST API for products: GET/POST/PUT/DELETE
 * - Visitor statistics: increment and get count
 * - Stores data in JSON files (products.json and stats.json)
 * - CORS enabled for demo frontend access
 * 
 * Requirements:
 * - Node.js environment
 * - Install dependencies: express, cors, multer, body-parser, fs
 * 
 * Run:
 *  node backend-server.js
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // For parsing JSON bodies with images base64
app.use(express.urlencoded({ extended: true }));

// Data file paths
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const STATS_FILE = path.join(__dirname, 'stats.json');

// Load or initialize products.json
function loadProducts() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE);
    return JSON.parse(data);
  } catch (e) {
    return []; // Start empty
  }
}

// Save products.json
function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

// Load or initialize stats.json
function loadStats() {
  try {
    const data = fs.readFileSync(STATS_FILE);
    return JSON.parse(data);
  } catch (e) {
    return { visits: 0 };
  }
}

// Save stats.json
function saveStats(stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

// Simple product ID generator (auto increment)
function generateProductId(products) {
  const maxId = products.reduce((max, p) => Math.max(max, p.id || 0), 0);
  return maxId + 1;
}

// Serve uploaded images if saved locally (currently images stored as base64 data in JSON, so no files saved)

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  const products = loadProducts();
  res.json(products);
});

// Add new product
app.post('/api/products', (req, res) => {
  const { name, description, image, alt } = req.body;
  if (!name || !description || !image || !alt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const products = loadProducts();
  const newProduct = {
    id: generateProductId(products),
    name,
    description,
    image,
    alt
  };
  products.push(newProduct);
  saveProducts(products);
  res.status(201).json(newProduct);
});

// Update product by id
app.put('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, description, image, alt } = req.body;
  if (!name || !description || !image || !alt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const products = loadProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) return res.status(404).json({ error: 'Product not found' });
  products[productIndex] = { id: productId, name, description, image, alt };
  saveProducts(products);
  res.json(products[productIndex]);
});

// Delete product by id
app.delete('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  let products = loadProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) return res.status(404).json({ error: 'Product not found' });
  products.splice(productIndex, 1);
  saveProducts(products);
  res.json({ message: 'Product deleted' });
});

// Visitor stats increment
app.post('/api/stats/visit', (req, res) => {
  const stats = loadStats();
  stats.visits = (stats.visits || 0) + 1;
  saveStats(stats);
  res.json({ visits: stats.visits });
});

// Get visitor stats
app.get('/api/stats', (req, res) => {
  const stats = loadStats();
  res.json(stats);
});

// Start server
app.listen(PORT, () => {
  console.log(`RDW backend server running at http://localhost:${PORT}`);
});

