const { Product, Shop, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.getStats = async (req, res) => {
  try {
    const totalShops = await Shop.count();
    const totalProducts = await Product.count();
    
    // Sum all stocks
    const totalStock = await Product.sum('stock') || 0;

    // Stock alerts
    const lowStockCount = await Product.count({
      where: {
        stock: { [Op.and]: [{ [Op.gt]: 0 }, { [Op.lte]: 10 }] }
      }
    });

    const outOfStockCount = await Product.count({
      where: { stock: 0 }
    });

    const totalAccounts = await User.count();

    // Group fruits by category
    const categoryStats = await Product.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('stock')), 'totalStock']
      ],
      group: ['category'],
      raw: true,
    });

    // Group product stock by Shop
    const shopStats = await Product.findAll({
      attributes: [
        'ShopId',
        [sequelize.fn('SUM', sequelize.col('stock')), 'totalStock']
      ],
      include: [
        {
          model: Shop,
          as: 'shop',
          attributes: ['name']
        }
      ],
      group: ['ShopId'],
    });

    const parsedShopStats = shopStats.map(stat => ({
      shopId: stat.ShopId,
      shopName: stat.shop ? stat.shop.name : '未知分店',
      totalStock: stat.getDataValue('totalStock') || 0
    }));

    // Simulated weekly sales/visitors trend for interactive UI charts
    const salesTrend = [
      { date: '周一', sales: 4800, orders: 120 },
      { date: '周二', sales: 5200, orders: 135 },
      { date: '周三', sales: 6100, orders: 154 },
      { date: '周四', sales: 5800, orders: 142 },
      { date: '周五', sales: 7400, orders: 188 },
      { date: '周六', sales: 9800, orders: 245 },
      { date: '周日', sales: 11200, orders: 290 },
    ];

    // Recent system operational logs to add professional liveliness
    const recentActivities = [
      { id: 1, type: 'info', title: '系统初始化', desc: '系统数据库结构同步与初始演示数据载入完成。', time: '刚刚' },
      { id: 2, type: 'warning', title: '库存预警触发', desc: '分店「每日优鲜 (望京店)」的「新奇士柠檬」已达预警线(3个)。', time: '10分钟前' },
      { id: 3, type: 'danger', title: '商品售罄', desc: '分店「每日优鲜 (望京店)」的「云南红肉火龙果」已售罄。', time: '1小时前' },
      { id: 4, type: 'success', title: '店铺状态更新', desc: '管理员更新了「四季鲜果 (通州店 - 筹备中)」的营业状态为 Closed。', time: '3小时前' },
      { id: 5, type: 'info', title: '新账户注册', desc: '创建了分店店员账号「staff」。', time: '4小时前' },
    ];

    return res.json({
      success: true,
      data: {
        cards: {
          totalShops,
          totalProducts,
          totalStock,
          lowStockCount,
          outOfStockCount,
          totalAccounts,
        },
        charts: {
          categoryStats,
          shopStats: parsedShopStats,
          salesTrend,
        },
        recentActivities,
      }
    });
  } catch (error) {
    logger.error('getStats error:', error);
    return res.status(500).json({ success: false, message: '获取统计面板数据失败' });
  }
};
