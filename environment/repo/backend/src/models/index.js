const sequelize = require('../config/database');
const User = require('./User');
const Shop = require('./Shop');
const Product = require('./Product');
const SystemSetting = require('./SystemSetting');

// Define Associations
Shop.hasMany(Product, {
  foreignKey: 'ShopId',
  as: 'products',
  onDelete: 'CASCADE',
});

Product.belongsTo(Shop, {
  foreignKey: 'ShopId',
  as: 'shop',
});

module.exports = {
  sequelize,
  User,
  Shop,
  Product,
  SystemSetting,
};
