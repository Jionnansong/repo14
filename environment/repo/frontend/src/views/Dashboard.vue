<template>
  <div class="space-y-6">
    <!-- Quick Overview Stats Row -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <el-skeleton v-for="i in 4" :key="i" animated :rows="3" class="glass-panel p-6 rounded-2xl" />
    </div>
    
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Total Shops -->
      <div class="glass-panel p-6 rounded-2xl flex items-center justify-between border border-slate-900 shadow-md">
        <div class="space-y-2">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">连锁分店数</span>
          <div class="text-3xl font-extrabold font-sans text-slate-100 tracking-tight">
            {{ stats.cards.totalShops }} <span class="text-xs font-normal text-slate-400">家</span>
          </div>
          <div class="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            各店均处于营业中
          </div>
        </div>
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
          <el-icon><Location /></el-icon>
        </div>
      </div>

      <!-- Card 2: Fruit Catalog -->
      <div class="glass-panel p-6 rounded-2xl flex items-center justify-between border border-slate-900 shadow-md">
        <div class="space-y-2">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">果品供应种类</span>
          <div class="text-3xl font-extrabold font-sans text-slate-100 tracking-tight">
            {{ stats.cards.totalProducts }} <span class="text-xs font-normal text-slate-400">种</span>
          </div>
          <div class="text-[10px] text-slate-400 font-medium">
            覆盖 6 大主流果品分类
          </div>
        </div>
        <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
          <el-icon><Apple /></el-icon>
        </div>
      </div>

      <!-- Card 3: Total Stock Pieces -->
      <div class="glass-panel p-6 rounded-2xl flex items-center justify-between border border-slate-900 shadow-md">
        <div class="space-y-2">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">商品总库存</span>
          <div class="text-3xl font-extrabold font-sans text-slate-100 tracking-tight">
            {{ stats.cards.totalStock }} <span class="text-xs font-normal text-slate-400">件/kg</span>
          </div>
          <div class="text-[10px] text-teal-400 font-medium">
            当前商品供应充沛
          </div>
        </div>
        <div class="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-xl">
          <el-icon><FolderOpened /></el-icon>
        </div>
      </div>

      <!-- Card 4: Low Stock Alert -->
      <div class="glass-panel p-6 rounded-2xl flex items-center justify-between border border-slate-900 shadow-md">
        <div class="space-y-2">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">预警及售罄</span>
          <div class="text-3xl font-extrabold font-sans text-slate-100 tracking-tight flex items-baseline gap-2">
            <span class="text-amber-500">{{ stats.cards.lowStockCount }}</span>
            <span class="text-slate-600 text-sm">/</span>
            <span class="text-rose-500">{{ stats.cards.outOfStockCount }}</span>
          </div>
          <div class="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500" :class="{ 'animate-pulse': stats.cards.lowStockCount + stats.cards.outOfStockCount > 0 }"></span>
            需要及时补充进货
          </div>
        </div>
        <div 
          class="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          :class="stats.cards.lowStockCount + stats.cards.outOfStockCount > 0 ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-slate-800 border border-slate-700 text-slate-400'"
        >
          <el-icon><Warning /></el-icon>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 1. Weekly Sales Trend Line Chart (SVG implementation) -->
      <div class="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-900 shadow-md">
        <div class="flex items-center justify-between mb-6">
          <div class="space-y-1">
            <h3 class="text-sm font-bold text-slate-200">销售趋势监控 (近七日)</h3>
            <p class="text-[11px] text-slate-400">连锁各分店销售额与交易总量趋势变化</p>
          </div>
          <div class="flex items-center gap-3 text-xs text-slate-400">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>销售额 (元)</span>
          </div>
        </div>

        <!-- Render SVG Line Chart -->
        <div class="relative w-full h-64 flex items-end">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 700 240" preserveAspectRatio="none">
            <!-- Grid Lines -->
            <line x1="0" y1="40" x2="700" y2="40" stroke="#1e293b" stroke-dasharray="4" />
            <line x1="0" y1="100" x2="700" y2="100" stroke="#1e293b" stroke-dasharray="4" />
            <line x1="0" y1="160" x2="700" y2="160" stroke="#1e293b" stroke-dasharray="4" />
            <line x1="0" y1="220" x2="700" y2="220" stroke="#1e293b" />

            <!-- Gradient Area beneath the line -->
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
              </linearGradient>
            </defs>

            <!-- Gradient Path -->
            <path 
              d="M 50 160 Q 150 150 150 150 T 250 120 T 350 130 T 450 90 T 550 45 T 650 20 L 650 220 L 50 220 Z" 
              fill="url(#chartGradient)"
            />

            <!-- Line Path -->
            <path 
              d="M 50 160 Q 150 150 150 150 T 250 120 T 350 130 T 450 90 T 550 45 T 650 20" 
              fill="none" 
              stroke="#10b981" 
              stroke-width="3" 
              stroke-linecap="round"
            />

            <!-- Data Dots -->
            <circle cx="50" cy="160" r="5" fill="#1e293b" stroke="#10b981" stroke-width="2" class="cursor-pointer hover:r-7 transition-all" />
            <circle cx="150" cy="150" r="5" fill="#1e293b" stroke="#10b981" stroke-width="2" />
            <circle cx="250" cy="120" r="5" fill="#1e293b" stroke="#10b981" stroke-width="2" />
            <circle cx="350" cy="130" r="5" fill="#1e293b" stroke="#10b981" stroke-width="2" />
            <circle cx="450" cy="90" r="5" fill="#1e293b" stroke="#10b981" stroke-width="2" />
            <circle cx="550" cy="45" r="5" fill="#1e293b" stroke="#10b981" stroke-width="2" />
            <circle cx="650" cy="20" r="5" fill="#1e293b" stroke="#10b981" stroke-width="2" />

            <!-- Labels for days underneath -->
            <text x="50" y="238" fill="#64748b" font-size="10" text-anchor="middle">周一</text>
            <text x="150" y="238" fill="#64748b" font-size="10" text-anchor="middle">周二</text>
            <text x="250" y="238" fill="#64748b" font-size="10" text-anchor="middle">周三</text>
            <text x="350" y="238" fill="#64748b" font-size="10" text-anchor="middle">周四</text>
            <text x="450" y="238" fill="#64748b" font-size="10" text-anchor="middle">周五</text>
            <text x="550" y="238" fill="#64748b" font-size="10" text-anchor="middle">周六</text>
            <text x="650" y="238" fill="#64748b" font-size="10" text-anchor="middle">周日</text>

            <!-- Value Callouts at Dots -->
            <text x="50" y="145" fill="#cbd5e1" font-size="9" text-anchor="middle">4.8k</text>
            <text x="150" y="135" fill="#cbd5e1" font-size="9" text-anchor="middle">5.2k</text>
            <text x="250" y="105" fill="#cbd5e1" font-size="9" text-anchor="middle">6.1k</text>
            <text x="350" y="115" fill="#cbd5e1" font-size="9" text-anchor="middle">5.8k</text>
            <text x="450" y="75" fill="#cbd5e1" font-size="9" text-anchor="middle">7.4k</text>
            <text x="550" y="30" fill="#cbd5e1" font-size="9" text-anchor="middle">9.8k</text>
            <text x="650" y="10" fill="#cbd5e1" font-size="9" text-anchor="middle">11.2k</text>
          </svg>
        </div>
      </div>

      <!-- 2. Category Distribution Stock Breakdown (CSS Bar implementation) -->
      <div class="glass-panel p-6 rounded-2xl border border-slate-900 shadow-md flex flex-col justify-between">
        <div class="space-y-1 mb-6">
          <h3 class="text-sm font-bold text-slate-200">分类品类库存占比</h3>
          <p class="text-[11px] text-slate-400">目前各水果品类在总仓库及分店的陈列货量占比</p>
        </div>

        <div class="space-y-4 flex-1 flex flex-col justify-center">
          <div v-for="item in processedCategories" :key="item.category" class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-slate-300 font-medium">{{ item.category }}</span>
              <span class="text-slate-400 font-bold">{{ item.totalStock }} <span class="text-[9px] font-normal text-slate-500">kg/盒</span> ({{ item.percent }}%)</span>
            </div>
            <div class="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-1000" 
                :class="item.color"
                :style="{ width: item.percent + '%' }"
              ></div>
            </div>
          </div>

          <div v-if="!stats.charts.categoryStats.length" class="text-center py-8 text-xs text-slate-500">
            暂无品类数据
          </div>
        </div>
      </div>
    </div>

    <!-- Lower Section -->
    <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 1. Shop Stocks Gauge -->
      <div class="glass-panel p-6 rounded-2xl border border-slate-900 shadow-md">
        <h3 class="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5">
          <el-icon class="text-emerald-400"><Shop /></el-icon>
          分店货量储备排名
        </h3>
        
        <div class="space-y-4">
          <div v-for="(shop, index) in stats.charts.shopStats" :key="shop.shopId" class="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-900/60 rounded-xl hover:bg-slate-900/80 transition-all">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-400 flex items-center justify-center">
                {{ index + 1 }}
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-200">{{ shop.shopName }}</span>
                <span class="text-[10px] text-slate-500 mt-0.5">货量配置等级: {{ getStockLevelLabel(shop.totalStock) }}</span>
              </div>
            </div>
            
            <div class="flex flex-col items-end">
              <span class="text-xs font-bold text-slate-300">{{ shop.totalStock }} <span class="text-[10px] font-normal text-slate-500">件</span></span>
              <span class="text-[10px] text-emerald-400 font-medium" v-if="shop.totalStock > 200">健康</span>
              <span class="text-[10px] text-amber-500 font-medium" v-else-if="shop.totalStock > 0">偏低</span>
              <span class="text-[10px] text-rose-500 font-medium" v-else>告急</span>
            </div>
          </div>

          <div v-if="!stats.charts.shopStats.length" class="text-center py-8 text-xs text-slate-500">
            暂无分店数据
          </div>
        </div>
      </div>

      <!-- 2. Operational Live Feed Logs -->
      <div class="glass-panel p-6 rounded-2xl border border-slate-900 shadow-md lg:col-span-2">
        <h3 class="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5">
          <el-icon class="text-amber-400"><Memo /></el-icon>
          平台实时业务流水日志
        </h3>

        <div class="space-y-3">
          <div 
            v-for="item in stats.recentActivities" 
            :key="item.id" 
            class="flex items-start gap-3 p-3 bg-slate-900/30 hover:bg-slate-900/70 border border-slate-900/40 rounded-xl transition-all"
          >
            <!-- Log Bullet Icon -->
            <div class="mt-0.5">
              <span v-if="item.type === 'success'" class="flex w-2 h-2 rounded-full bg-emerald-500"></span>
              <span v-else-if="item.type === 'warning'" class="flex w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span v-else-if="item.type === 'danger'" class="flex w-2 h-2 rounded-full bg-rose-500"></span>
              <span v-else class="flex w-2 h-2 rounded-full bg-slate-500"></span>
            </div>
            
            <div class="flex-1 flex justify-between gap-4">
              <div class="space-y-1">
                <div class="text-xs font-bold text-slate-200 flex items-center gap-2">
                  {{ item.title }}
                  <span 
                    class="text-[9px] px-1.5 py-0.2 rounded font-medium border"
                    :class="getLogBadgeClass(item.type)"
                  >
                    {{ item.type }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-400 leading-relaxed">{{ item.desc }}</p>
              </div>
              <span class="text-[10px] text-slate-500 whitespace-nowrap">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import request from '../utils/request';
import { useAuthStore } from '../store';
import { 
  Location, 
  Apple, 
  FolderOpened, 
  Warning,
  Shop,
  Memo
} from '@element-plus/icons-vue';

const authStore = useAuthStore();
const loading = ref(true);
const stats = ref({
  cards: {
    totalShops: 0,
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalAccounts: 0,
  },
  charts: {
    categoryStats: [],
    shopStats: [],
    salesTrend: [],
  },
  recentActivities: [],
});

const getStockLevelLabel = (stock) => {
  if (stock > 400) return '高冗余 A级';
  if (stock > 200) return '正常储备 B级';
  if (stock > 50) return '偏低 C级';
  return '极危需配货 D级';
};

const getLogBadgeClass = (type) => {
  switch (type) {
    case 'success': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    case 'danger': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    default: return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
  }
};

const processedCategories = computed(() => {
  const catStats = stats.value.charts.categoryStats || [];
  if (!catStats.length) return [];
  
  // Total inventory
  const total = catStats.reduce((sum, item) => sum + parseInt(item.totalStock || 0), 0) || 1;
  
  // Beautiful array of colors for the categories
  const barColors = [
    'bg-gradient-to-r from-emerald-500 to-teal-400',  // Emerald
    'bg-gradient-to-r from-amber-500 to-orange-400', // Citrus
    'bg-gradient-to-r from-rose-500 to-pink-400',    // Berry
    'bg-gradient-to-r from-teal-500 to-cyan-400',    // Tropical
    'bg-gradient-to-r from-indigo-500 to-violet-400', // Melons
    'bg-gradient-to-r from-slate-400 to-slate-500'   // Default
  ];

  return catStats.map((item, index) => {
    const rawStock = parseInt(item.totalStock || 0);
    const percent = Math.round((rawStock / total) * 100);
    return {
      category: item.category || '未分类',
      totalStock: rawStock,
      percent,
      color: barColors[index % barColors.length],
    };
  }).sort((a, b) => b.totalStock - a.totalStock); // Sort descending
});

const fetchStats = async () => {
  loading.value = true;
  try {
    const res = await request.get('/dashboard/stats');
    if (res.success) {
      stats.value = res.data;
    }
  } catch (error) {
    // Handled globally
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
/* Specific animations if required */
</style>
