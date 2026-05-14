<template>
  <el-container class="min-h-screen bg-slate-950">
    <!-- Sidebar for Large Screens -->
    <el-aside 
      :width="isCollapsed ? '64px' : '260px'" 
      class="hidden md:block border-r border-slate-900 bg-slate-950/80 backdrop-blur-md transition-all duration-300 ease-in-out select-none"
    >
      <div class="flex flex-col h-full">
        <!-- Sidebar Brand Logo -->
        <div class="flex items-center justify-center h-16 border-b border-slate-900 px-4 overflow-hidden gap-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-md">
            <span class="text-xl">🍉</span>
          </div>
          <span 
            v-show="!isCollapsed" 
            class="text-base font-bold font-sans bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tight transition-all truncate"
          >
            佳果纷呈平台
          </span>
        </div>

        <!-- Sidebar Navigation Menu -->
        <div class="flex-1 py-4 overflow-y-auto">
          <el-menu
            :default-active="activePath"
            router
            class="!border-none"
            :collapse="isCollapsed"
            background-color="transparent"
            text-color="#94a3b8"
            active-text-color="#ffffff"
          >
            <el-menu-item index="/dashboard">
              <el-icon><Odometer /></el-icon>
              <template #title><span>数据面板</span></template>
            </el-menu-item>

            <el-menu-item index="/shops">
              <el-icon><Location /></el-icon>
              <template #title><span>商铺管理</span></template>
            </el-menu-item>

            <el-menu-item index="/products">
              <el-icon><Apple /></el-icon>
              <template #title><span>商品管理</span></template>
            </el-menu-item>

            <!-- Admin-Only Account Link -->
            <el-menu-item index="/accounts" v-if="authStore.isAdmin">
              <el-icon><User /></el-icon>
              <template #title><span>账号管理</span></template>
            </el-menu-item>

            <el-menu-item index="/settings">
              <el-icon><Setting /></el-icon>
              <template #title><span>系统设置</span></template>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-slate-900 flex items-center gap-3 overflow-hidden" v-show="!isCollapsed">
          <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700/80 font-bold text-emerald-400 text-sm">
            {{ authStore.user?.username?.substring(0, 2).toUpperCase() || 'AD' }}
          </div>
          <div class="flex flex-col truncate">
            <span class="text-xs font-semibold text-slate-200 truncate">{{ authStore.user?.username }}</span>
            <span class="text-[10px] text-slate-500 font-medium truncate">{{ authStore.user?.role === 'Admin' ? '超级管理员' : '分店店员' }}</span>
          </div>
        </div>
      </div>
    </el-aside>

    <!-- Main Container -->
    <el-container class="flex flex-col min-h-screen">
      <!-- Header -->
      <el-header class="h-16 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md px-4 flex items-center justify-between z-20">
        <!-- Header Left (Toggle button + Title) -->
        <div class="flex items-center gap-4">
          <button 
            @click="isCollapsed = !isCollapsed" 
            class="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          >
            <el-icon v-if="isCollapsed"><Expand /></el-icon>
            <el-icon v-else><Fold /></el-icon>
          </button>
          
          <!-- Mobile Menu Drawer Toggle -->
          <button 
            @click="mobileMenuVisible = true" 
            class="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          >
            <el-icon><Menu /></el-icon>
          </button>

          <h2 class="text-sm md:text-base font-semibold text-slate-200 tracking-wide font-sans">
            {{ pageTitle }}
          </h2>
        </div>

        <!-- Header Right (Notifications + Actions + Profile) -->
        <div class="flex items-center gap-4">
          <!-- Notification Bell -->
          <el-tooltip content="系统通知" placement="bottom">
            <button class="relative w-8 h-8 rounded-lg border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all">
              <el-icon class="text-base"><Bell /></el-icon>
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
          </el-tooltip>

          <!-- User Info Dropdown -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="flex items-center gap-2 cursor-pointer select-none">
              <!-- Avatar -->
              <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shadow-inner">
                {{ authStore.user?.username?.substring(0, 1).toUpperCase() || 'A' }}
              </div>
              <span class="hidden sm:inline text-xs font-semibold text-slate-300">
                {{ authStore.user?.username }}
              </span>
              <!-- Role Badge -->
              <el-tag 
                size="small" 
                class="!border-none" 
                :type="authStore.isAdmin ? 'success' : 'warning'"
              >
                {{ authStore.isAdmin ? '主管' : '店员' }}
              </el-tag>
            </div>
            
            <template #dropdown>
              <el-dropdown-menu class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-1 shadow-glass">
                <div class="px-4 py-2 border-b border-slate-800/80 mb-1">
                  <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">登录账户</div>
                  <div class="text-xs font-bold text-slate-200 mt-1">{{ authStore.user?.username }}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5" v-if="authStore.user?.contactInfo">
                    {{ authStore.user?.contactInfo }}
                  </div>
                </div>
                <el-dropdown-item command="profile" :icon="User">个人信息</el-dropdown-item>
                <el-dropdown-item command="settings" :icon="Setting">系统设置</el-dropdown-item>
                <el-dropdown-item command="logout" :icon="SwitchButton" divided class="!text-rose-400 hover:!bg-rose-500/5">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Main Content -->
      <el-main class="flex-1 p-4 md:p-6 bg-slate-950 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- Mobile Drawer Sidebar Menu -->
    <el-drawer
      v-model="mobileMenuVisible"
      direction="ltr"
      size="260px"
      :with-header="false"
      class="!bg-slate-950 !border-r !border-slate-900"
    >
      <div class="flex flex-col h-full py-4 bg-slate-950 text-slate-100">
        <!-- Logo -->
        <div class="flex items-center h-12 px-6 gap-3 mb-6">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span class="text-lg">🍉</span>
          </div>
          <span class="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
            佳果纷呈平台
          </span>
        </div>

        <!-- Menu -->
        <el-menu
          :default-active="activePath"
          router
          class="!border-none flex-1"
          background-color="transparent"
          text-color="#94a3b8"
          active-text-color="#ffffff"
          @select="mobileMenuVisible = false"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>数据面板</span>
          </el-menu-item>

          <el-menu-item index="/shops">
            <el-icon><Location /></el-icon>
            <span>商铺管理</span>
          </el-menu-item>

          <el-menu-item index="/products">
            <el-icon><Apple /></el-icon>
            <span>商品管理</span>
          </el-menu-item>

          <el-menu-item index="/accounts" v-if="authStore.isAdmin">
            <el-icon><User /></el-icon>
            <span>账号管理</span>
          </el-menu-item>

          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>

        <!-- Footer profile -->
        <div class="px-6 py-4 border-t border-slate-900 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-emerald-400 text-sm">
            {{ authStore.user?.username?.substring(0, 2).toUpperCase() }}
          </div>
          <div class="flex flex-col truncate">
            <span class="text-xs font-semibold text-slate-200">{{ authStore.user?.username }}</span>
            <span class="text-[10px] text-slate-500 uppercase">{{ authStore.user?.role === 'Admin' ? '超级管理员' : '分店店员' }}</span>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- Profile Dialog -->
    <el-dialog
      v-model="profileDialogVisible"
      title="个人信息"
      width="380px"
      align-center
    >
      <div class="flex flex-col items-center py-4">
        <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-2xl font-bold flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/5">
          {{ authStore.user?.username?.substring(0, 1).toUpperCase() }}
        </div>
        <h3 class="text-lg font-bold text-slate-100">{{ authStore.user?.username }}</h3>
        
        <div class="flex items-center gap-1.5 mt-1">
          <el-tag :type="authStore.isAdmin ? 'success' : 'warning'" size="small">
            {{ authStore.isAdmin ? '系统管理员' : '分店店员' }}
          </el-tag>
          <el-tag type="info" size="small">在线</el-tag>
        </div>

        <div class="w-full border-t border-slate-800/80 my-5"></div>

        <div class="w-full space-y-3.5 text-xs text-slate-300">
          <div class="flex justify-between">
            <span class="text-slate-500 font-medium">账号 ID:</span>
            <span class="font-bold text-slate-200">{{ authStore.user?.id }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 font-medium">联系方式:</span>
            <span class="font-bold text-slate-200">{{ authStore.user?.contactInfo || '未绑定电话' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 font-medium">所属机构:</span>
            <span class="font-bold text-slate-200">佳果纷呈连锁销售公司</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 font-medium">系统状态:</span>
            <span class="font-bold text-emerald-400">运行正常</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="profileDialogVisible = false" class="w-full">关闭</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Odometer, 
  Location, 
  Apple, 
  User, 
  Setting, 
  Fold, 
  Expand, 
  Menu, 
  Bell,
  SwitchButton
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isCollapsed = ref(false);
const mobileMenuVisible = ref(false);
const profileDialogVisible = ref(false);

const activePath = computed(() => route.path);

const pageTitle = computed(() => {
  switch (route.name) {
    case 'Dashboard': return '销售与库存监控面板';
    case 'Shops': return '连锁分店实体管理';
    case 'Products': return '果品库存供应目录';
    case 'Accounts': return '系统操作账户安全';
    case 'Settings': return '平台全局参数设置';
    default: return '佳果纷呈管理系统';
  }
});

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm(
      '确定要退出当前管理账号，安全断开会话吗？',
      '安全退出',
      {
        confirmButtonText: '确定退出',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: '!bg-rose-500 !hover:bg-rose-400 !border-none',
      }
    ).then(() => {
      authStore.logout();
      ElMessage({
        message: '账号会话已安全关闭，再见！',
        type: 'success',
      });
      router.push('/login');
    }).catch(() => {});
  } else if (command === 'profile') {
    profileDialogVisible.value = true;
  } else if (command === 'settings') {
    router.push('/settings');
  }
};
</script>

<style scoped>
/* Page transition animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
