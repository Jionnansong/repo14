const { Shop } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.listShops = async (req, res) => {
  try {
    const { search = '', status = '' } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const shops = await Shop.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: shops,
    });
  } catch (error) {
    logger.error('listShops error:', error);
    return res.status(500).json({ success: false, message: '获取店铺列表失败' });
  }
};

exports.createShop = async (req, res) => {
  try {
    const { name, location, contact, openingHours, status } = req.body;

    if (!name || !location || !contact) {
      return res.status(400).json({ success: false, message: '店铺名称、地址和联系方式为必填项' });
    }

    const newShop = await Shop.create({
      name,
      location,
      contact,
      openingHours: openingHours || '08:00 - 22:00',
      status: status || 'Open',
    });

    logger.info(`店铺创建成功: ${name}`);

    return res.status(214).json({
      success: true,
      message: '创建店铺成功',
      data: newShop,
    });
  } catch (error) {
    logger.error('createShop error:', error);
    return res.status(500).json({ success: false, message: '创建店铺失败' });
  }
};

exports.updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, contact, openingHours, status } = req.body;

    const shop = await Shop.findByPk(id);
    if (!shop) {
      return res.status(404).json({ success: false, message: '店铺不存在' });
    }

    await shop.update({
      name: name !== undefined ? name : shop.name,
      location: location !== undefined ? location : shop.location,
      contact: contact !== undefined ? contact : shop.contact,
      openingHours: openingHours !== undefined ? openingHours : shop.openingHours,
      status: status !== undefined ? status : shop.status,
    });

    logger.info(`店铺更新成功: ${shop.name}`);

    return res.json({
      success: true,
      message: '修改店铺成功',
      data: shop,
    });
  } catch (error) {
    logger.error('updateShop error:', error);
    return res.status(500).json({ success: false, message: '更新店铺失败' });
  }
};

exports.deleteShop = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await Shop.findByPk(id);
    if (!shop) {
      return res.status(404).json({ success: false, message: '店铺不存在' });
    }

    await shop.destroy();
    logger.info(`店铺及关联商品删除成功: ${shop.name}`);

    return res.json({
      success: true,
      message: '删除店铺成功',
    });
  } catch (error) {
    logger.error('deleteShop error:', error);
    return res.status(500).json({ success: false, message: '删除店铺失败' });
  }
};
