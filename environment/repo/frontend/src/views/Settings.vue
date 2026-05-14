<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Breadcrumb Header -->
    <div class="space-y-1">
      <h3 class="text-lg font-bold text-slate-100 flex items-center gap-1.5">
        <el-icon class="text-emerald-400"><Setting /></el-icon>
        平台全局系统设置
      </h3>
      <p class="text-xs text-slate-400">配置本连锁商铺平台的名称标识、技术客服支持、以及自动数据库轮换备份与全局公告通告。</p>
    </div>

    <!-- Main Config Panel Card -->
    <div class="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-900 shadow-xl" v-loading="loading">
      <div v-if="!authStore.isAdmin" class="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs flex items-center gap-2">
        <el-icon class="text-sm"><Warning /></el-icon>
        当前登录账户权限为「分店店员」。系统设置页面切换为【只读模式】。修改系统全局参数请使用管理员账号登录。
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <!-- 1. System Name -->
        <el-form-item prop="sys_name" class="mb-6">
          <template #label>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">平台系统名称</span>
          </template>
          <el-input 
            v-model="form.sys_name" 
            placeholder="请输入系统主标题名称" 
            :disabled="!authStore.isAdmin"
            size="large"
          />
        </el-form-item>

        <!-- 2. Technical Support Contact -->
        <el-form-item prop="sys_contact" class="mb-6">
          <template #label>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">官方技术支持客服 Email</span>
          </template>
          <el-input 
            v-model="form.sys_contact" 
            placeholder="请输入客服支持邮箱，如 support@..." 
            :disabled="!authStore.isAdmin"
            size="large"
          />
        </el-form-item>

        <!-- 3. Database Backup Interval -->
        <el-form-item prop="sys_backup_interval" class="mb-6">
          <template #label>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">数据库自动全量备份周期</span>
          </template>
          <el-select 
            v-model="form.sys_backup_interval" 
            placeholder="请选择备份轮转周期" 
            :disabled="!authStore.isAdmin"
            class="!w-full"
            size="large"
          >
            <el-option label="每小时 (适合高频调拨)" value="每小时" />
            <el-option label="每天凌晨3点 (默认，推荐)" value="每天凌晨3点" />
            <el-option label="每周日晚23:00" value="每周日" />
            <el-option label="手动触发备份 (关闭自动备份)" value="手动备份" />
          </el-select>
        </el-form-item>

        <!-- 4. System Announcement -->
        <el-form-item prop="sys_announcement" class="mb-8">
          <template #label>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">各分店客户端全局广播公告</span>
          </template>
          <el-input 
            v-model="form.sys_announcement" 
            type="textarea" 
            :rows="4" 
            placeholder="请在此输入全局滚屏广播内容，各分店店员端登录后将自动显示..." 
            :disabled="!authStore.isAdmin"
          />
        </el-form-item>

        <!-- Action submit -->
        <div class="border-t border-slate-900/60 pt-6 flex justify-end gap-3" v-if="authStore.isAdmin">
          <el-button @click="fetchSettings" icon="Refresh" size="large">放弃修改</el-button>
          <el-button 
            type="primary" 
            @click="handleSubmit" 
            :loading="submitting" 
            icon="Check"
            size="large"
            class="!px-6"
          >
            保存并应用配置
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import request from '../utils/request';
import { useAuthStore } from '../store';
import { ElMessage } from 'element-plus';
import { Setting, Warning, Check, Refresh } from '@element-plus/icons-vue';

const authStore = useAuthStore();

const loading = ref(false);
const submitting = ref(false);
const formRef = ref(null);

const form = reactive({
  sys_name: '佳果纷呈 - 智能连锁水果商铺管理平台',
  sys_contact: 'support@jiaguofencheng.com',
  sys_backup_interval: '每天凌晨3点',
  sys_announcement: '🍒欢迎使用佳果纷呈连锁销售平台。',
});

const rules = {
  sys_name: [{ required: true, message: '系统名称标题不能为空', trigger: 'blur' }],
  sys_contact: [
    { required: true, message: '联系邮箱不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入格式正确的电子邮箱地址', trigger: 'blur' },
  ],
};

const fetchSettings = async () => {
  loading.value = true;
  try {
    const res = await request.get('/settings');
    if (res.success && res.data) {
      // Overwrite key fields if they exist in response
      if (res.data.sys_name) form.sys_name = res.data.sys_name;
      if (res.data.sys_contact) form.sys_contact = res.data.sys_contact;
      if (res.data.sys_backup_interval) form.sys_backup_interval = res.data.sys_backup_interval;
      if (res.data.sys_announcement) form.sys_announcement = res.data.sys_announcement;
    }
  } catch (error) {
    // Handled globally
  } finally {
    loading.value = false;
  }
};

const handleSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        const res = await request.put('/settings', form);
        if (res.success) {
          ElMessage.success(res.message);
          // Reload settings values to ensure correctness
          fetchSettings();
        }
      } catch (error) {
        // Handled globally
      } finally {
        submitting.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchSettings();
});
</script>

<style scoped>
/* Settings components adjustments */
</style>
