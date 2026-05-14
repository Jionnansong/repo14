const { Product, Shop } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.listProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', ShopId = '', stockStatus = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { origin: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) {
      where.category = category;
    }
    if (ShopId) {
      where.ShopId = ShopId;
    }

    // Stock filtering logic
    if (stockStatus === 'out') {
      where.stock = 0;
    } else if (stockStatus === 'low') {
      where.stock = { [Op.and]: [{ [Op.gt]: 0 }, { [Op.lte]: 10 }] };
    } else if (stockStatus === 'normal') {
      where.stock = { [Op.gt]: 10 };
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Shop,
          as: 'shop',
          attributes: ['name'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: {
        total: count,
        list: products,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('listProducts error:', error);
    return res.status(500).json({ success: false, message: '获取商品列表失败' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, unit, origin, description, imageUrl, ShopId } = req.body;

    if (!name || price === undefined || stock === undefined || !ShopId) {
      return res.status(400).json({ success: false, message: '商品名称、售价、库存以及所属店铺为必填项' });
    }

    // Check if Shop exists
    const shop = await Shop.findByPk(ShopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: '所选店铺不存在' });
    }

    const newProduct = await Product.create({
      name,
      category: category || '其他',
      price,
      stock,
      unit: unit || 'kg',
      origin,
      description,
      imageUrl,
      ShopId,
    });

    logger.info(`商品创建成功: ${name}`);

    return res.status(214).json({
      success: true,
      message: '创建商品成功',
      data: newProduct,
    });
  } catch (error) {
    logger.error('createProduct error:', error);
    return res.status(500).json({ success: false, message: '创建商品失败' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, unit, origin, description, imageUrl, ShopId } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    if (ShopId) {
      const shop = await Shop.findByPk(ShopId);
      if (!shop) {
        return res.status(404).json({ success: false, message: '所选店铺不存在' });
      }
    }

    await product.update({
      name: name !== undefined ? name : product.name,
      category: category !== undefined ? category : product.category,
      price: price !== undefined ? price : product.price,
      stock: stock !== undefined ? stock : product.stock,
      unit: unit !== undefined ? unit : product.unit,
      origin: origin !== undefined ? origin : product.origin,
      description: description !== undefined ? description : product.description,
      imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
      ShopId: ShopId !== undefined ? ShopId : product.ShopId,
    });

    logger.info(`商品更新成功: ${product.name}`);

    return res.json({
      success: true,
      message: '修改商品成功',
      data: product,
    });
  } catch (error) {
    logger.error('updateProduct error:', error);
    return res.status(500).json({ success: false, message: '更新商品失败' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    await product.destroy();
    logger.info(`商品删除成功: ${product.name}`);

    return res.json({
      success: true,
      message: '删除商品成功',
    });
  } catch (error) {
    logger.error('deleteProduct error:', error);
    return res.status(500).json({ success: false, message: '删除商品失败' });
  }
};
