const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shop = sequelize.define('Shop', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  openingHours: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '08:00 - 22:00',
  },
  status: {
    type: DataTypes.ENUM('Open', 'Closed'),
    allowNull: false,
    defaultValue: 'Open',
  },
}, {
  timestamps: true,
});

module.exports = Shop;
