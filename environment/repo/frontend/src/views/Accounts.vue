<template>
  <div class="space-y-6">
    <!-- Breadcrumb Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1">
        <h3 class="text-lg font-bold text-slate-100 flex items-center gap-1.5">
          <el-icon class="text-emerald-400"><User /></el-icon>
          账号安全配置
        </h3>
        <p class="text-xs text-slate-400">管理允许登录本系统的连锁品牌总部或各分店店员账号。</p>
      </div>
      
      <el-button 
        type="primary" 
        size="large" 
        icon="Plus"
        @click="openAddDialog"
        class="!shadow-md"
      >
        新建操作账号
      </el-button>
    </div>

    <!-- Search/Filters Area -->
    <div class="glass-panel p-4 rounded-xl border border-slate-900/80 flex flex-wrap gap-4 items-center">
      <el-input 
        v-model="filters.search" 
        placeholder="搜索用户名" 
        prefix-icon="Search" 
        class="!w-48 sm:!w-64"
        clearable
        @input="handleSearch"
      />
      
      <el-select v-model="filters.role" placeholder="选择角色" class="!w-32" clearable @change="fetchAccounts">
        <el-option label="超级管理员" value="Admin" />
        <el-option label="分店店员" value="Staff" />
      </el-select>

      <el-select v-model="filters.status" placeholder="选择状态" class="!w-32" clearable @change="fetchAccounts">
        <el-option label="启用" value="Active" />
        <el-option label="停用" value="Inactive" />
      </el-select>

      <el-button @click="resetFilters" icon="Refresh" type="info" plain>重置</el-button>
    </div>

    <!-- Data Table Card -->
    <div class="glass-panel rounded-2xl border border-slate-900 overflow-hidden shadow-lg">
      <el-table :data="accounts" v-loading="loading" style="width: 100%" class="!text-sm">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        
        <el-table-column prop="username" label="用户名" min-width="120">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-200">{{ row.username }}</span>
              <el-tag v-if="row.id === authStore.user?.id" size="small" effect="plain" type="info">我自己</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="role" label="权限角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.role === 'Admin' ? 'success' : 'warning'" effect="light">
              {{ row.role === 'Admin' ? '管理员' : '店员' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="contactInfo" label="联系电话" min-width="130" align="center">
          <template #default="{ row }">
            <span class="text-slate-300 font-mono">{{ row.contactInfo || '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="账户状态" width="110" align="center">
          <template #default="{ row }">
            <el-switch 
              v-model="row.status" 
              active-value="Active" 
              inactive-value="Inactive"
              active-text="启用"
              inactive-text="停用"
              inline-prompt
              :disabled="row.id === authStore.user?.id"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="注册时间" width="160" align="center">
          <template #default="{ row }">
            <span class="text-slate-400 font-mono text-xs">{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column label="管理操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1.5">
              <el-button size="small" type="primary" plain @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" type="warning" plain @click="openResetPasswordDialog(row)">密码</el-button>
              <el-button 
                size="small" 
                type="danger" 
                plain 
                :disabled="row.id === authStore.user?.id"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination Block -->
      <div class="p-4 border-t border-slate-900 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          background
          @size-change="fetchAccounts"
          @current-change="fetchAccounts"
        />
      </div>
    </div>

    <!-- Create/Edit Account Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑账号信息' : '创建新操作账号'"
      width="440px"
      @close="closeDialog"
    >
      <el-form :model="form" :rules="formRules" ref="formRef" label-position="top">
        <el-form-item label="用户名" prop="username" class="mb-4" v-if="!isEdit">
          <el-input v-model="form.username" placeholder="请输入独一无二的登录用户名" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password" class="mb-4" v-if="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="请输入安全的登录密码(不小于6位)" show-password />
        </el-form-item>

        <el-form-item label="权限角色" prop="role" class="mb-4">
          <el-radio-group v-model="form.role">
            <el-radio-button label="Admin">超级管理员</el-radio-button>
            <el-radio-button label="Staff">分店店员</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="联系电话 (选填)" prop="contactInfo" class="mb-4">
          <el-input v-model="form.contactInfo" placeholder="请输入绑定的联系电话" />
        </el-form-item>

        <el-form-item label="初始启用状态" prop="status" class="mb-4" v-if="!isEdit">
          <el-switch 
            v-model="form.status" 
            active-value="Active" 
            inactive-value="Inactive"
            active-text="启用"
            inactive-text="停用"
          />
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

    <!-- Reset Password Dialog -->
    <el-dialog
      v-model="pwDialogVisible"
      title="重置账号登录密码"
      width="380px"
      @close="pwForm.password = ''"
    >
      <div class="mb-4 text-xs text-slate-400">
        正在为账号 <span class="font-bold text-slate-200">「{{ pwForm.username }}」</span> 重设新的安全口令。
      </div>
      
      <el-form :model="pwForm" :rules="pwFormRules" ref="pwFormRef" label-position="top">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="pwForm.password" type="password" placeholder="请输入不少于6位的新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex gap-2">
          <el-button @click="pwDialogVisible = false" class="flex-1">取消</el-button>
          <el-button type="primary" @click="handleResetPasswordSubmit" :loading="pwSubmitting" class="flex-1">
            确定重设
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
import { User } from '@element-plus/icons-vue';

const authStore = useAuthStore();

const loading = ref(false);
const submitting = ref(false);
const pwSubmitting = ref(false);
const dialogVisible = ref(false);
const pwDialogVisible = ref(false);
const isEdit = ref(false);

const accounts = ref([]);
const filters = reactive({
  search: '',
  role: '',
  status: '',
});

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
});

const formRef = ref(null);
const form = reactive({
  id: null,
  username: '',
  password: '',
  role: 'Staff',
  status: 'Active',
  contactInfo: '',
});

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度需在 3 至 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度需在 6 至 20 个字符之间', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色类型', trigger: 'change' }],
};

const pwFormRef = ref(null);
const pwForm = reactive({
  id: null,
  username: '',
  password: '',
});

const pwFormRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '新密码长度至少为 6 个字符', trigger: 'blur' },
  ],
};

const fetchAccounts = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
      role: filters.role,
      status: filters.status,
    };
    const res = await request.get('/accounts', { params });
    if (res.success) {
      accounts.value = res.data.list;
      pagination.total = res.data.total;
    }
  } catch (error) {
    // Handled by request interceptors
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchAccounts();
};

const resetFilters = () => {
  filters.search = '';
  filters.role = '';
  filters.status = '';
  pagination.page = 1;
  fetchAccounts();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleStatusChange = async (row, val) => {
  try {
    const res = await request.put(`/accounts/${row.id}`, { status: val });
    if (res.success) {
      ElMessage.success(`已成功将「${row.username}」账号状态改为: ${val === 'Active' ? '启用' : '停用'}`);
    } else {
      row.status = val === 'Active' ? 'Inactive' : 'Active'; // Revert switch toggle
    }
  } catch (error) {
    row.status = val === 'Active' ? 'Inactive' : 'Active'; // Revert switch toggle
  }
};

const openAddDialog = () => {
  isEdit.value = false;
  form.id = null;
  form.username = '';
  form.password = '';
  form.role = 'Staff';
  form.status = 'Active';
  form.contactInfo = '';
  dialogVisible.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  form.id = row.id;
  form.username = row.username;
  form.role = row.role;
  form.status = row.status;
  form.contactInfo = row.contactInfo || '';
  dialogVisible.value = true;
};

const openResetPasswordDialog = (row) => {
  pwForm.id = row.id;
  pwForm.username = row.username;
  pwForm.password = '';
  pwDialogVisible.value = true;
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
          // Edit operation
          const res = await request.put(`/accounts/${form.id}`, {
            role: form.role,
            contactInfo: form.contactInfo,
          });
          if (res.success) {
            ElMessage.success(res.message);
            dialogVisible.value = false;
            fetchAccounts();
          }
        } else {
          // Create operation
          const res = await request.post('/accounts', form);
          if (res.success) {
            ElMessage.success(res.message);
            dialogVisible.value = false;
            fetchAccounts();
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

const handleResetPasswordSubmit = () => {
  if (!pwFormRef.value) return;
  pwFormRef.value.validate(async (valid) => {
    if (valid) {
      pwSubmitting.value = true;
      try {
        const res = await request.put(`/accounts/${pwForm.id}/reset-password`, {
          password: pwForm.password,
        });
        if (res.success) {
          ElMessage.success(res.message);
          pwDialogVisible.value = false;
        }
      } catch (error) {
        // Handled globally
      } finally {
        pwSubmitting.value = false;
      }
    }
  });
};

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `此操作将永久注销「${row.username}」的系统使用权限，确定继续吗？`,
    '安全警告',
    {
      confirmButtonText: '确定注销',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: '!bg-rose-500 !hover:bg-rose-400 !border-none',
    }
  ).then(async () => {
    try {
      const res = await request.delete(`/accounts/${row.id}`);
      if (res.success) {
        ElMessage.success(res.message);
        fetchAccounts();
      }
    } catch (error) {
      // Handled globally
    }
  }).catch(() => {});
};

onMounted(() => {
  fetchAccounts();
});
</script>

<style scoped>
/* Scoped styles */
</style>
