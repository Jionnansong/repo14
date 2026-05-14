<template>
  <div class="space-y-6">
    <!-- Breadcrumb Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1">
        <h3 class="text-lg font-bold text-slate-100 flex items-center gap-1.5">
          <span class="text-xl">🍎</span>
          商品与库存管理
        </h3>
        <p class="text-xs text-slate-400">实时调拨、增补、以及审查连锁门店内陈列的所有水果货品目录与保质库存。</p>
      </div>
      
      <div class="flex gap-2">
        <!-- Layout mode toggler -->
        <el-radio-group v-model="layoutMode" size="large" class="!shadow-sm">
          <el-radio-button label="grid">
            <el-icon><Menu /></el-icon> 橱窗
          </el-radio-button>
          <el-radio-button label="table">
            <el-icon><Fold /></el-icon> 列表
          </el-radio-button>
        </el-radio-group>

        <el-button 
          type="primary" 
          size="large" 
          icon="Plus"
          @click="openAddDialog"
          class="!shadow-md"
        >
          上架新果品
        </el-button>
      </div>
    </div>

    <!-- Multi-Filter Control Area -->
    <div class="glass-panel p-4 rounded-xl border border-slate-900/80 flex flex-wrap gap-4 items-center">
      <!-- Search Input -->
      <el-input 
        v-model="filters.search" 
        placeholder="搜索水果名称、产地" 
        prefix-icon="Search" 
        class="!w-48 sm:!w-64"
        clearable
        @input="handleFilterChange"
      />
      
      <!-- Category select -->
      <el-select v-model="filters.category" placeholder="果品品类" class="!w-32" clearable @change="handleFilterChange">
        <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
      </el-select>

      <!-- Shop branch select -->
      <el-select v-model="filters.ShopId" placeholder="所属门店" class="!w-44" clearable @change="handleFilterChange">
        <el-option v-for="shop in shops" :key="shop.id" :label="shop.name" :value="shop.id" />
      </el-select>

      <!-- Stock status filter -->
      <el-select v-model="filters.stockStatus" placeholder="库存警戒" class="!w-32" clearable @change="handleFilterChange">
        <el-option label="充足 (10+)" value="normal" />
        <el-option label="紧张 (1-10)" value="low" />
        <el-option label="售罄 (0)" value="out" />
      </el-select>

      <el-button @click="resetFilters" icon="Refresh" type="info" plain>重置</el-button>
    </div>

    <!-- Layout 1: Grid Mode -->
    <div v-if="layoutMode === 'grid'" v-loading="loading" class="min-h-[250px]">
      <div v-if="products.length === 0" class="text-center py-20 text-slate-500 text-xs flex flex-col items-center gap-2">
        <span class="text-3xl">🥝</span>
        未发现符合当前检索条件的上架果品
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <!-- Fruit Grid Cards -->
        <div 
          v-for="prod in products" 
          :key="prod.id" 
          class="glass-panel rounded-2xl overflow-hidden border border-slate-900 shadow-md hover:translate-y-[-4px] hover:shadow-xl hover:border-slate-800 transition-all duration-300 flex flex-col justify-between"
        >
          <!-- Thumbnail & Tag overlays -->
          <div class="relative h-44 bg-slate-900 overflow-hidden group">
            <img 
              :src="prod.imageUrl || 'https://images.unsplash.com/photo-1610397613050-5999f1b6c86e?auto=format&fit=crop&w=400&q=80'" 
              :alt="prod.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            <!-- Category Tag overlay -->
            <span class="absolute top-3 left-3 bg-slate-950/85 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 border border-slate-800">
              {{ prod.category }}
            </span>

            <!-- Low/Out of Stock warning banner -->
            <div 
              v-if="prod.stock === 0"
              class="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center text-rose-500 text-sm font-extrabold tracking-widest"
            >
              已售罄 (SOLD OUT)
            </div>
            <div 
              v-else-if="prod.stock <= 10"
              class="absolute top-3 right-3 bg-rose-500/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow animate-pulse"
            >
              急需补货
            </div>
          </div>

          <!-- Product Body -->
          <div class="p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div class="space-y-1.5">
              <div class="flex justify-between items-start gap-2">
                <h4 class="text-sm font-bold text-slate-100 truncate flex-1">{{ prod.name }}</h4>
                <span class="text-xs font-mono font-bold text-emerald-400">¥{{ prod.price }} <span class="text-[9px] font-normal text-slate-500">/{{ prod.unit }}</span></span>
              </div>
              
              <div class="flex gap-1.5 text-[10px] text-slate-400">
                <span class="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">{{ prod.origin || '未知产地' }}</span>
                <span class="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 truncate max-w-[120px]">{{ prod.shop?.name || '未知分店' }}</span>
              </div>

              <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">{{ prod.description || '暂无该果品介绍，鲜嫩美味，绿色天然。' }}</p>
            </div>

            <div class="border-t border-slate-900/60 pt-4 flex items-center justify-between">
              <!-- Stock Indicator -->
              <div class="flex flex-col">
                <span class="text-[10px] text-slate-500 font-medium">可用货量</span>
                <span 
                  class="text-xs font-bold font-mono mt-0.5"
                  :class="prod.stock === 0 ? 'text-rose-500' : prod.stock <= 10 ? 'text-amber-500' : 'text-slate-300'"
                >
                  {{ prod.stock }} {{ prod.unit }}
                </span>
              </div>

              <!-- Quick action links -->
              <div class="flex gap-1">
                <el-button size="small" type="primary" plain @click="openEditDialog(prod)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="handleDelete(prod)">下架</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Layout 2: Dense Table Mode -->
    <div v-else class="glass-panel rounded-2xl border border-slate-900 overflow-hidden shadow-lg">
      <el-table :data="products" v-loading="loading" style="width: 100%" class="!text-sm">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        
        <el-table-column prop="name" label="商品果品" min-width="150">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <el-avatar :src="row.imageUrl" :size="32" shape="square" class="border border-slate-800" />
              <div class="flex flex-col truncate">
                <span class="font-bold text-slate-200 truncate">{{ row.name }}</span>
                <span class="text-[10px] text-slate-500 truncate mt-0.5">ID: {{ row.id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="130" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info" class="!font-medium">{{ row.category }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="price" label="销售单价" width="110" align="right">
          <template #default="{ row }">
            <span class="font-mono text-emerald-400 font-bold">¥{{ row.price }}</span>
            <span class="text-[10px] text-slate-500 font-mono">/{{ row.unit }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="stock" label="库存量" width="100" align="center">
          <template #default="{ row }">
            <span 
              class="font-mono font-bold"
              :class="row.stock === 0 ? 'text-rose-500' : row.stock <= 10 ? 'text-amber-500' : 'text-slate-300'"
            >
              {{ row.stock }}
            </span>
            <span class="text-[10px] text-slate-500 font-mono"> {{ row.unit }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="origin" label="原产地" width="120" align="center" />

        <el-table-column prop="shop" label="上架门店" min-width="140">
          <template #default="{ row }">
            <span class="text-xs text-slate-300 truncate block">{{ row.shop?.name || '未知门店' }}</span>
          </template>
        </el-table-column>

        <!-- Table Actions -->
        <el-table-column label="库存操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1.5">
              <el-button size="small" type="primary" plain @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="handleDelete(row)">下架</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Unified Pagination Block -->
    <div class="p-4 border-t border-slate-900/60 bg-slate-950 flex justify-end">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[4, 8, 12, 20]"
        layout="total, sizes, prev, pager, next"
        background
        @size-change="fetchProducts"
        @current-change="fetchProducts"
      />
    </div>

    <!-- Product CRUD Form Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑果品库存明细' : '上架新果品陈列'"
      width="480px"
      @close="closeDialog"
    >
      <el-form :model="form" :rules="formRules" ref="formRef" label-position="top">
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="果品名称" prop="name" class="col-span-2 mb-4">
            <el-input v-model="form.name" placeholder="例如: 丹东红颜草莓" />
          </el-form-item>

          <el-form-item label="所属品类" prop="category" class="mb-4">
            <el-select v-model="form.category" placeholder="请选择或输入" allow-create filterable>
              <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
            </el-select>
          </el-form-item>

          <el-form-item label="分配门店" prop="ShopId" class="mb-4">
            <el-select v-model="form.ShopId" placeholder="选择摆货分店">
              <el-option v-for="shop in shops" :key="shop.id" :label="shop.name" :value="shop.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="上架售价" prop="price" class="mb-4">
            <el-input-number v-model="form.price" :precision="2" :step="0.5" :min="0" class="!w-full" />
          </el-form-item>

          <el-form-item label="计重单位" prop="unit" class="mb-4">
            <el-input v-model="form.unit" placeholder="如: kg, 盒, 个, 包" />
          </el-form-item>

          <el-form-item label="初始库存" prop="stock" class="mb-4">
            <el-input-number v-model="form.stock" :min="0" :precision="0" class="!w-full" />
          </el-form-item>

          <el-form-item label="原产地" prop="origin" class="mb-4">
            <el-input v-model="form.origin" placeholder="如: 新疆阿克苏" />
          </el-form-item>

          <el-form-item label="果品宣传大图 (URL)" prop="imageUrl" class="col-span-2 mb-4">
            <el-input v-model="form.imageUrl" placeholder="请填写水果配图链接或使用默认图" />
          </el-form-item>

          <el-form-item label="果品特色文案介绍" prop="description" class="col-span-2 mb-4">
            <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请描述该水果特色，吸引顾客购买..." />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="flex gap-2">
          <el-button @click="dialogVisible = false" class="flex-1">取消</el-button>
          <el-button type="primary" @click="handleFormSubmit" :loading="submitting" class="flex-1">
            确认提交
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import request from '../utils/request';
import { useAuthStore } from '../store';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Menu, Fold, Plus, Search, Refresh } from '@element-plus/icons-vue';

const authStore = useAuthStore();

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const layoutMode = ref('grid'); // 'grid' or 'table'

const products = ref([]);
const shops = ref([]);
const categories = ref([
  '浆果类 (Berries)',
  '柑橘类 (Citrus)',
  '热带水果 (Tropical)',
  '核果类 (Stone Fruit)',
  '仁果类 (Pomes)',
  '瓜类 (Melons)',
  '其他'
]);

const filters = reactive({
  search: '',
  category: '',
  ShopId: '',
  stockStatus: '',
});

const pagination = reactive({
  page: 1,
  limit: 8,
  total: 0,
});

const formRef = ref(null);
const form = reactive({
  id: null,
  name: '',
  category: '其他',
  price: 5.0,
  stock: 100,
  unit: 'kg',
  origin: '',
  description: '',
  imageUrl: '',
  ShopId: null,
});

const formRules = {
  name: [{ required: true, message: '请输入果品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择或输入果品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入销售单价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入初始库存量', trigger: 'blur' }],
  ShopId: [{ required: true, message: '请指定摆放分店', trigger: 'change' }],
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
      category: filters.category,
      ShopId: filters.ShopId,
      stockStatus: filters.stockStatus,
    };
    const res = await request.get('/products', { params });
    if (res.success) {
      products.value = res.data.list;
      pagination.total = res.data.total;
    }
  } catch (error) {
    // Handled globally
  } finally {
    loading.value = false;
  }
};

const fetchShopsDropdown = async () => {
  try {
    const res = await request.get('/shops');
    if (res.success) {
      shops.value = res.data;
    }
  } catch (error) {
    // Handled globally
  }
};

const handleFilterChange = () => {
  pagination.page = 1;
  fetchProducts();
};

const resetFilters = () => {
  filters.search = '';
  filters.category = '';
  filters.ShopId = '';
  filters.stockStatus = '';
  pagination.page = 1;
  fetchProducts();
};

const openAddDialog = () => {
  isEdit.value = false;
  form.id = null;
  form.name = '';
  form.category = '其他';
  form.price = 5.0;
  form.stock = 100;
  form.unit = 'kg';
  form.origin = '';
  form.description = '';
  form.imageUrl = '';
  form.ShopId = shops.value.length ? shops.value[0].id : null;
  dialogVisible.value = true;
};

const openEditDialog = (prod) => {
  isEdit.value = true;
  form.id = prod.id;
  form.name = prod.name;
  form.category = prod.category;
  form.price = parseFloat(prod.price);
  form.stock = parseInt(prod.stock);
  form.unit = prod.unit;
  form.origin = prod.origin || '';
  form.description = prod.description || '';
  form.imageUrl = prod.imageUrl || '';
  form.ShopId = prod.ShopId;
  dialogVisible.value = true;
};

const closeDialog = () => {
  if (formRef.value) formRef.value.resetFields();
};

const handleFormSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (isEdit.value) {
          const res = await request.put(`/products/${form.id}`, form);
          if (res.success) {
            ElMessage.success(res.message);
            dialogVisible.value = false;
            fetchProducts();
          }
        } else {
          const res = await request.post('/products', form);
          if (res.success) {
            ElMessage.success(res.message);
            dialogVisible.value = false;
            fetchProducts();
          }
        }
      } catch (error) {
        // Handled globally
      } finally {
        submitting.value = false;
      }
    }
  });
};

const handleDelete = (prod) => {
  ElMessageBox.confirm(
    `此操作将立即下架果品「${prod.name}」并归零库存记录，确定下架继续吗？`,
    '下架确认',
    {
      confirmButtonText: '确定下架',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: '!bg-rose-500 !hover:bg-rose-400 !border-none',
    }
  ).then(async () => {
    try {
      const res = await request.delete(`/products/${prod.id}`);
      if (res.success) {
        ElMessage.success(res.message);
        fetchProducts();
      }
    } catch (error) {
      // Handled globally
    }
  }).catch(() => {});
};

onMounted(() => {
  fetchShopsDropdown();
  fetchProducts();
});
</script>

<style scoped>
/* Specific animations or line clamp effects */
</style>
