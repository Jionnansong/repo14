const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');
const logger = require('../utils/logger');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请填写用户名和密码' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      logger.warn(`登录失败: 用户名 ${username} 不存在`);
      return res.status(401).json({ success: false, message: '用户名或密码不正确' });
    }

    if (user.status !== 'Active') {
      logger.warn(`登录失败: 账号已被禁用 ${username}`);
      return res.status(403).json({ success: false, message: '该账号已被停用，请联系管理员。' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`登录失败: 用户 ${username} 密码不匹配`);
      return res.status(401).json({ success: false, message: '用户名或密码不正确' });
    }

    // Sign Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`用户登录成功: ${username} (角色: ${user.role})`);

    return res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          contactInfo: user.contactInfo,
        },
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({ success: false, message: '服务器内部错误，请稍后再试' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'role', 'status', 'contactInfo'],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: '未找到用户信息' });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('getMe error:', error);
    return res.status(500).json({ success: false, message: '服务器内部错误' });
  }
};
