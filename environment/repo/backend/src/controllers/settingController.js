const { SystemSetting } = require('../models');
const logger = require('../utils/logger');

exports.getSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findAll();
    
    // Format array of {key, value} to an object { [key]: value }
    const formatted = {};
    settings.forEach(item => {
      formatted[item.key] = item.value;
    });

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    logger.error('getSettings error:', error);
    return res.status(500).json({ success: false, message: '获取系统配置失败' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const body = req.body; // Expectations: { key1: value1, key2: value2 }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, message: '请求参数格式不正确' });
    }

    // Perform updates sequentially
    for (const [key, value] of Object.entries(body)) {
      await SystemSetting.upsert({
        key,
        value: String(value),
      });
    }

    logger.info('系统全局配置已更新。');

    // Fetch the updated configurations
    const settings = await SystemSetting.findAll();
    const formatted = {};
    settings.forEach(item => {
      formatted[item.key] = item.value;
    });

    return res.json({
      success: true,
      message: '更新系统配置成功',
      data: formatted,
    });
  } catch (error) {
    logger.error('updateSettings error:', error);
    return res.status(500).json({ success: false, message: '更新系统配置失败' });
  }
};
