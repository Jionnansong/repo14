const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');
const { sequelize, User } = require('./models');
const seedDatabase = require('./config/seed');

// Import Middlewares & Controllers
const { authenticateToken, requireRole } = require('./middleware/auth');
const authController = require('./controllers/authController');
const accountController = require('./controllers/accountController');
const shopController = require('./controllers/shopController');
const productController = require('./controllers/productController');
const dashboardController = require('./controllers/dashboardController');
const settingController = require('./controllers/settingController');

const app = express();
const PORT = process.env.PORT || 3014;

// Enable CORS and body parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ================= ROUTE REGISTER =================

// 1. Authentication Routes
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authenticateToken, authController.getMe);

// 2. Dashboard Statistics
app.get('/api/dashboard/stats', authenticateToken, dashboardController.getStats);

// 3. Accounts Management (Admin Only)
app.get('/api/accounts', authenticateToken, requireRole('Admin'), accountController.listAccounts);
app.post('/api/accounts', authenticateToken, requireRole('Admin'), accountController.createAccount);
app.put('/api/accounts/:id', authenticateToken, requireRole('Admin'), accountController.updateAccount);
app.put('/api/accounts/:id/reset-password', authenticateToken, requireRole('Admin'), accountController.resetPassword);
app.delete('/api/accounts/:id', authenticateToken, requireRole('Admin'), accountController.deleteAccount);

// 4. Shop Management
app.get('/api/shops', authenticateToken, shopController.listShops);
app.post('/api/shops', authenticateToken, requireRole('Admin'), shopController.createShop);
app.put('/api/shops/:id', authenticateToken, requireRole('Admin'), shopController.updateShop);
app.delete('/api/shops/:id', authenticateToken, requireRole('Admin'), shopController.deleteShop);

// 5. Product (Fruit) Inventory Management
app.get('/api/products', authenticateToken, productController.listProducts);
app.post('/api/products', authenticateToken, productController.createProduct);
app.put('/api/products/:id', authenticateToken, productController.updateProduct);
app.delete('/api/products/:id', authenticateToken, productController.deleteProduct);

// 6. System Settings
app.get('/api/settings', authenticateToken, settingController.getSettings);
app.put('/api/settings', authenticateToken, requireRole('Admin'), settingController.updateSettings);

// ================= STATIC FILES & ROUTER SPA FALLBACK =================

// Serve compiled static assets from Vue frontend public folder
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Fallback to index.html for Vue SPA Router client-side path parsing
app.get('*', (req, res, next) => {
  // If requesting api routes, bypass static fallback and return 404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Endpoint not found.' });
  }
  res.sendFile(path.join(publicPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled Server Error: %o', err);
  res.status(500).json({
    success: false,
    message: '发生未知的服务器内部错误，请稍后再试。',
  });
});

// ================= DB SYNC & SERVER LAUNCH =================

async function startServer() {
  try {
    // Authenticate database
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Sync database schemas
    await sequelize.sync();

    // Check if seeding is required (if no User exists in DB)
    const userCount = await User.count();
    if (userCount === 0) {
      logger.info('No user account detected in database. Triggering automatic database seed...');
      await seedDatabase();
    } else {
      logger.info('Database already initialized. Skipping auto-seed.');
    }

    // Bind port and start listening
    app.listen(PORT, () => {
      logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to initialize server or database:', error);
    process.exit(1);
  }
}

startServer();
