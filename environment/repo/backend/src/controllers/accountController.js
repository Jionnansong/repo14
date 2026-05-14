const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.listAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.username = { [Op.like]: `%${search}%` };
    }
    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
    }

    const { count, rows: accounts } = await User.findAndCountAll({
      where,
      attributes: ['id', 'username', 'role', 'status', 'contactInfo', 'createdAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: {
        total: count,
        list: accounts,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('listAccounts error:', error);
    return res.status(500).json({ success: false, message: '获取账号列表失败' });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { username, password, role, status, contactInfo } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码必填' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ success: false, message: '用户名已被注册' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      password: passwordHash,
      role: role || 'Staff',
      status: status || 'Active',
      contactInfo,
    });

    logger.info(`管理员创建账号成功: ${username} (角色: ${newUser.role})`);

    return res.status(214).json({
      success: true,
      message: '创建账号成功',
      data: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        status: newUser.status,
        contactInfo: newUser.contactInfo,
      },
    });
  } catch (error) {
    logger.error('createAccount error:', error);
    return res.status(500).json({ success: false, message: '创建账号失败' });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, contactInfo } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '账号不存在' });
    }

    // Protection: Cannot deactivate yourself
    if (user.id === req.user.id && status === 'Inactive') {
      return res.status(400).json({ success: false, message: '不能停用您自己的账号' });
    }

    // Protection: Cannot change your own role from Admin to Staff
    if (user.id === req.user.id && role === 'Staff' && req.user.role === 'Admin') {
      return res.status(400).json({ success: false, message: '不能降低您自己的角色权限' });
    }

    await user.update({
      role: role || user.role,
      status: status || user.status,
      contactInfo: contactInfo !== undefined ? contactInfo : user.contactInfo,
    });

    logger.info(`账号更新成功: ${user.username}`);

    return res.json({
      success: true,
      message: '修改账号成功',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        contactInfo: user.contactInfo,
      },
    });
  } catch (error) {
    logger.error('updateAccount error:', error);
    return res.status(500).json({ success: false, message: '更新账号失败' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: '新密码必填' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '账号不存在' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await user.update({ password: passwordHash });
    logger.info(`账号密码重置成功: ${user.username}`);

    return res.json({
      success: true,
      message: '重置密码成功',
    });
  } catch (error) {
    logger.error('resetPassword error:', error);
    return res.status(500).json({ success: false, message: '重置密码失败' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '账号不存在' });
    }

    // Protection: Cannot delete yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: '不能删除您自己的账号' });
    }

    await user.destroy();
    logger.info(`账号删除成功: ${user.username}`);

    return res.json({
      success: true,
      message: '删除账号成功',
    });
  } catch (error) {
    logger.error('deleteAccount error:', error);
    return res.status(500).json({ success: false, message: '删除账号失败' });
  }
};
