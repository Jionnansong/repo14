const bcrypt = require('bcryptjs');
const { sequelize, User, Shop, Product, SystemSetting } = require('../models');

async function seed() {
  try {
    // Sync DB (force true to overwrite existing for clean seeding if requested)
    await sequelize.sync({ force: true });
    console.log('Database synchronized.');

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const staffPassword = await bcrypt.hash('staff123', salt);

    const users = await User.bulkCreate([
      {
        username: 'admin',
        password: adminPassword,
        role: 'Admin',
        status: 'Active',
        contactInfo: '13800138000',
      },
      {
        username: 'staff',
        password: staffPassword,
        role: 'Staff',
        status: 'Active',
        contactInfo: '13800138001',
      },
      {
        username: 'inactive_user',
        password: staffPassword,
        role: 'Staff',
        status: 'Inactive',
        contactInfo: '13800138002',
      }
    ]);
    console.log('Users seeded successfully.');

    // 2. Seed Shops
    const shops = await Shop.bulkCreate([
      {
        name: '阳光百果园 (首府店)',
        location: '北京市朝阳区阳光大道101号',
        contact: '010-88889999',
        openingHours: '08:00 - 22:30',
        status: 'Open',
      },
      {
        name: '鲜果满仓 (中关村店)',
        location: '北京市海淀区中关村南路56号',
        contact: '010-66667777',
        openingHours: '09:00 - 22:00',
        status: 'Open',
      },
      {
        name: '每日优鲜 (望京店)',
        location: '北京市朝阳区望京SOHO大厦B座',
        contact: '010-55556666',
        openingHours: '08:30 - 23:00',
        status: 'Open',
      },
      {
        name: '四季鲜果 (通州店 - 筹备中)',
        location: '北京市通州区运河东大街202号',
        contact: '010-44443333',
        openingHours: '10:00 - 21:00',
        status: 'Closed',
      }
    ]);
    console.log('Shops seeded successfully.');

    // 3. Seed Products associated with Shops
    const shop1Id = shops[0].id;
    const shop2Id = shops[1].id;
    const shop3Id = shops[2].id;

    await Product.bulkCreate([
      {
        name: '丹东红颜草莓',
        category: '浆果类 (Berries)',
        price: 29.80,
        stock: 120,
        unit: '盒',
        origin: '辽宁丹东',
        description: '新鲜采摘丹东红颜草莓，红润饱满，甜美多汁，无农残。',
        imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80',
        ShopId: shop1Id,
      },
      {
        name: '春见粑粑柑',
        category: '柑橘类 (Citrus)',
        price: 9.90,
        stock: 450,
        unit: 'kg',
        origin: '四川蒲江',
        description: '春见优质柑橘，皮薄肉厚，清甜化渣，极度多汁。',
        imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&q=80',
        ShopId: shop1Id,
      },
      {
        name: '泰国金枕榴莲',
        category: '热带水果 (Tropical)',
        price: 188.00,
        stock: 12,
        unit: '个',
        origin: '泰国尖竹汶',
        description: '精选泰国进口金枕榴莲，果肉金黄饱满，口感如冰淇淋般细腻浓郁。',
        imageUrl: 'https://images.unsplash.com/photo-1594911775796-03c0383188d3?auto=format&fit=crop&w=400&q=80',
        ShopId: shop1Id,
      },
      {
        name: '烟台红灯大樱桃',
        category: '核果类 (Stone Fruit)',
        price: 58.00,
        stock: 85,
        unit: '盒',
        origin: '山东烟台',
        description: '烟台大球红樱桃，肉质紧实，酸甜爽口，色泽鲜亮。',
        imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80',
        ShopId: shop2Id,
      },
      {
        name: '阿克苏冰糖心苹果',
        category: '仁果类 (Pomes)',
        price: 12.80,
        stock: 350,
        unit: 'kg',
        origin: '新疆阿克苏',
        description: '高海拔充足日照，自带冰糖心，脆甜多汁，皮薄爽口。',
        imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
        ShopId: shop2Id,
      },
      {
        name: '海南无籽麒麟瓜',
        category: '瓜类 (Melons)',
        price: 5.80,
        stock: 160,
        unit: 'kg',
        origin: '海南三亚',
        description: '海南大棚沙地种植西瓜，甜度极高，冰镇后更佳。',
        imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
        ShopId: shop2Id,
      },
      {
        name: '菲律宾超甜金菠萝',
        category: '热带水果 (Tropical)',
        price: 18.00,
        stock: 65,
        unit: '个',
        origin: '菲律宾',
        description: '菲律宾进口黄金菠萝，无需盐水浸泡，甜而不涩，浓郁芳香。',
        imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80',
        ShopId: shop3Id,
      },
      {
        name: '高山红富士苹果',
        category: '仁果类 (Pomes)',
        price: 8.80,
        stock: 220,
        unit: 'kg',
        origin: '陕西洛川',
        description: '洛川红富士苹果，天然无污染，果香四溢，清脆甜爽。',
        imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80',
        ShopId: shop3Id,
      },
      {
        name: '云南红肉火龙果',
        category: '热带水果 (Tropical)',
        price: 15.00,
        stock: 0,
        unit: 'kg',
        origin: '云南元江',
        description: '云南红心火龙果，甜度比白心更高，富含花青素，营养丰富。 (已售罄)',
        imageUrl: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=400&q=80',
        ShopId: shop3Id,
      },
      {
        name: '新奇士柠檬',
        category: '柑橘类 (Citrus)',
        price: 3.50,
        stock: 3,
        unit: '个',
        origin: '美国加州',
        description: '加州阳光充足，酸度充沛，果香浓郁，泡茶首选。 (库存紧张)',
        imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=400&q=80',
        ShopId: shop3Id,
      }
    ]);
    console.log('Products seeded successfully.');

    // 4. Seed System Settings
    await SystemSetting.bulkCreate([
      { key: 'sys_name', value: '佳果纷呈 - 智能连锁水果商铺管理平台' },
      { key: 'sys_contact', value: 'support@jiaguofencheng.com' },
      { key: 'sys_backup_interval', value: '每天凌晨3点' },
      { key: 'sys_announcement', value: '🍒【今日主推】辽宁丹东红颜草莓及泰国金枕榴莲，请各分店做好展台堆头陈列与促销宣传。所有分店请于周五前核对好本周库存。' },
      { key: 'sys_theme', value: 'dark' }
    ]);
    console.log('SystemSettings seeded successfully.');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run if called directly
if (require.main === module) {
  sequelize.authenticate()
    .then(() => seed())
    .catch(err => console.error('Connection failed:', err));
}

module.exports = seed;
