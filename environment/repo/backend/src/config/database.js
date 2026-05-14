const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Set to true or a custom logging function if detailed SQL queries are needed
});

module.exports = sequelize;
