<template>
  <div class="space-y-6">
    <!-- Breadcrumbs & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1">
        <h3 class="text-lg font-bold text-slate-100 flex items-center gap-1.5">
          <el-icon class="text-emerald-400"><Location /></el-icon>
          连锁分店管理
        </h3>
        <p class="text-xs text-slate-400">登记与分配各地区实体直营店/加盟店，并管理其对外运营状态与联系方式。</p>
      </div>
      
      <el-button 
        type="primary" 
        size="large" 
        icon="Plus"
        v-if="authStore.isAdmin"
        @click="openAddDialog"
        class="!shadow-md"
      >
        登记新实体门店
      </el-button>
    </div>

    <!-- Filtering & Searching -->
    <div class="glass-panel p-4 rounded-xl border border-slate-900/80 flex flex-wrap gap-4 items-center">
      <el-input 
        v-model="filters.search" 
        placeholder="搜索分店名称、地址" 
        prefix-icon="Search" 
        class="!w-48 sm:!w-64"
        clearable
        @input="fetchShops"
      />
      
      <el-select v-model="filters.status" placeholder="运营状态" class="!w-32" clearable @change="fetchShops">
        <el-option label="营业中" value="Open" />
        <el-option label="暂停营业" value="Closed" />
      </el-select>

      <el-button @click="resetFilters" icon="Refresh" type="info" plain>重置</el-button>
    </div>

    <!-- Shops Cards Grid -->
    <div v-loading="loading" class="min-h-[200px]">
      <div v-if="shops.length === 0" class="text-center py-16 text-slate-500 text-xs flex flex-col items-center gap-2">
        <span class="text-3xl">🏪</span>
        未发现符合检索条件的分店信息
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Card component for each shop -->
        <div 
          v-for="shop in shops" 
          :key="shop.id" 
          class="glass-panel rounded-2xl p-6 border border-slate-900 shadow-md hover:translate-y-[-4px] hover:shadow-lg hover:border-slate-800 transition-all duration-300 flex flex-col justify-between gap-6"
        >
          <!-- Upper Row -->
          <div class="space-y-4">
            <div class="flex justify-between items-start gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-lg flex items-center justify-center">
                  🏪
                </div>
                <div>
                  <h4 class="text-sm font-bold text-slate-100">{{ shop.name }}</h4>
                  <span class="text-[10px] text-slate-500">ID: {{ shop.id }}</span>
                </div>
              </div>
              
              <!-- Status Tag -->
              <el-tag :type="shop.status === 'Open' ? 'success' : 'danger'" size="small">
                {{ shop.status === 'Open' ? '营业中' : '暂停营业' }}
              </el-tag>
            </div>

            <!-- Details list -->
            <div class="space-y-2 text-xs text-slate-300 border-t border-slate-900/60 pt-4">
              <div class="flex items-start gap-2">
                <el-icon class="text-slate-500 mt-0.5"><Location /></el-icon>
                <span>{{ shop.location }}</span>
              </div>
              <div class="flex items-center gap-2">
                <el-icon class="text-slate-500"><Phone /></el-icon>
                <span>{{ shop.contact }}</span>
              </div>
              <div class="flex items-center gap-2">
                <el-icon class="text-slate-500"><Clock /></el-icon>
                <span>{{ shop.openingHours }}</span>
              </div>
            </div>
          </div>

          <!-- Bottom Actions (Only for Admin) -->
          <div class="flex items-center justify-between border-t border-slate-900/60 pt-4" v-if="authStore.isAdmin">
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-500 font-medium">营业状态</span>
              <el-switch 
                v-model="shop.status" 
                active-value="Open" 
                inactive-value="Closed"
                size="small"
                @change="(val) => handleStatusChange(shop, val)"
              />
            </div>

            <div class="flex gap-1.5">
              <el-button size="small" type="primary" plain icon="Edit" @click="openEditDialog(shop)">编辑</el-button>
              <el-button size="small" type="danger" plain icon="Delete" @click="handleDelete(shop)">删除</el-button>
            </div>
          </div>
          <div class="text-[10px] text-slate-500 text-right italic" v-else>
            * 仅管理员可调整分店运营参数
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑门店运营信息' : '开辟新连锁门店登记'"
      width="450px"
      @close="closeDialog"
    >
      <el-form :model="form" :rules="formRules" ref="formRef" label-position="top">
        <el-form-item label="分店名称" prop="name" class="mb-4">
          <el-input v-model="form.name" placeholder="例如: 阳光百果园 (西单店)" />
        </el-form-item>

        <el-form-item label="门店物理地址" prop="location" class="mb-4">
          <el-input v-model="form.location" placeholder="请填入店铺精确街道/门牌号地址" type="textarea" :rows="2" />
        </el-form-item>

        <el-form-item label="门店服务热线" prop="contact" class="mb-4">
          <el-input v-model="form.contact" placeholder="例如: 010-88889999 或 138..." />
        </el-form-item>

        <el-form-item label="每日营业时间" prop="openingHours" class="mb-4">
          <el-input v-model="form.openingHours" placeholder="默认: 08:00 - 22:00" />
        </el-form-item>

        <el-form-item label="初始营业状态" prop="status" class="mb-4" v-if="!isEdit">
          <el-radio-group v-model="form.status">
            <el-radio-button label="Open">营业中 (Open)</el-radio-button>
            <el-radio-button label="Closed">闭店筹备 (Closed)</el-radio-button>
          </el-radio-group>
        </el-form-item>
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
import { Location, Phone, Clock, Plus, Edit, Delete, Refresh, Search } from '@element-plus/icons-vue';

const authStore = useAuthStore();

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);

const shops = ref([]);
const filters = reactive({
  search: '',
  status: '',
});

const formRef = ref(null);
const form = reactive({
  id: null,
  name: '',
  location: '',
  contact: '',
  openingHours: '08:00 - 22:00',
  status: 'Open',
});

const formRules = {
  name: [{ required: true, message: '请填写店铺名称', trigger: 'blur' }],
  location: [{ required: true, message: '请填写物理地址', trigger: 'blur' }],
  contact: [{ required: true, message: '请填写客服联系电话', trigger: 'blur' }],
};

const fetchShops = async () => {
  loading.value = true;
  try {
    const params = {
      search: filters.search,
      status: filters.status,
    };
    const res = await request.get('/shops', { params });
    if (res.success) {
      shops.value = res.data;
    }
  } catch (error) {
    // Handled globally
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.search = '';
  filters.status = '';
  fetchShops();
};

const handleStatusChange = async (shop, val) => {
  try {
    const res = await request.put(`/shops/${shop.id}`, { status: val });
    if (res.success) {
      ElMessage.success(`分店「${shop.name}」状态已调整为: ${val === 'Open' ? '正在营业' : '打烊收市'}`);
    } else {
      shop.status = val === 'Open' ? 'Closed' : 'Open';
    }
  } catch (error) {
    shop.status = val === 'Open' ? 'Closed' : 'Open';
  }
};

const openAddDialog = () => {
  isEdit.value = false;
  form.id = null;
  form.name = '';
  form.location = '';
  form.contact = '';
  form.openingHours = '08:00 - 22:00';
  form.status = 'Open';
  dialogVisible.value = true;
};

const openEditDialog = (shop) => {
  isEdit.value = true;
  form.id = shop.id;
  form.name = shop.name;
  form.location = shop.location;
  form.contact = shop.contact;
  form.openingHours = shop.openingHours;
  form.status = shop.status;
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
          const res = await request.put(`/shops/${form.id}`, form);
          if (res.success) {
            ElMessage.success(res.message);
            dialogVisible.value = false;
            fetchShops();
          }
        } else {
          const res = await request.post('/shops', form);
          if (res.success) {
            ElMessage.success(res.message);
            dialogVisible.value = false;
            fetchShops();
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

const handleDelete = (shop) => {
  ElMessageBox.confirm(
    `🚨 警告：注销门店「${shop.name}」将永久删除其所有关联果品和库存数据。此操作不可恢复，确定要继续吗？`,
    '高危安全警报',
    {
      confirmButtonText: '确定注销',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: '!bg-rose-500 !hover:bg-rose-400 !border-none',
    }
  ).then(async () => {
    try {
      const res = await request.delete(`/shops/${shop.id}`);
      if (res.success) {
        ElMessage.success(res.message);
        fetchShops();
      }
    } catch (error) {
      // Handled globally
    }
  }).catch(() => {});
};

onMounted(() => {
  fetchShops();
});
</script>

<style scoped>
/* Shop scoped card transitions */
</style>
