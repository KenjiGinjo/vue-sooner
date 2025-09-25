<template>
  <div class="demo-container">
    <h1>Vue Sooner - Toast Component Demo</h1>
    
    <div class="button-group">
      <button @click="testSuccess">Success Toast</button>
      <button @click="testError">Error Toast</button>
      <button @click="testInfo">Info Toast</button>
      <button @click="testWarning">Warning Toast</button>
      <button @click="testLoading">Loading Toast</button>
      <button @click="testCustom">Custom Toast</button>
      <button @click="testPromise">Promise Toast</button>
      <button @click="dismissAll">Dismiss All</button>
    </div>

    <div class="toast-info">
      <h3>Active Toasts: {{ toasts.length }}</h3>
      <p>Debug: {{ JSON.stringify(toasts, null, 2) }}</p>
      <ul>
        <li v-for="toast in toasts" :key="toast.id">
          {{ toast.title }} - {{ toast.type }}
        </li>
      </ul>
    </div>

    <!-- Toast Container -->
    <Toaster
      position="bottom-right"
      theme="light"
      :duration="4000"
      :gap="8"
      :visible-toasts="5"
      :close-button="true"
      :rich-colors="true"
      :expand="false"
    />
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { useToast } from '../src/composables/useToast'

// Toast composable
const { 
  toast, 
  success, 
  error, 
  info, 
  warning, 
  loading, 
  custom, 
  promise, 
  dismissAll, 
  toasts 
} = useToast()

// Test methods
const testSuccess = () => {
  success('操作成功！', {
    description: '数据已保存到服务器',
    duration: 3000
  })
}

const testError = () => {
  error('操作失败！', {
    description: '请检查网络连接后重试',
    duration: 5000
  })
}

const testInfo = () => {
  info('新消息', {
    description: '您有3条未读消息',
    duration: 4000
  })
}

const testWarning = () => {
  warning('注意', {
    description: '此操作不可撤销',
    duration: 6000
  })
}

const testLoading = () => {
  loading('处理中...', {
    description: '请稍候',
    duration: 0 // Don't auto-dismiss loading toasts
  })
}

const testCustom = () => {
  custom((id) => {
    // Return a Vue VNode using h function
    return h('div', [
      h('h4', 'Custom Toast'),
      h('p', 'This is a custom toast with Vue content')
    ])
  }, {
    duration: 4000
  })
}

const testPromise = () => {
  const mockPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() > 0.5 ? resolve('Success!') : reject(new Error('Failed!'))
    }, 2000)
  })

  promise(mockPromise, {
    loading: 'Processing request...',
    success: (data) => `Request completed: ${data}`,
    error: (error) => `Request failed: ${error.message}`,
    description: 'This will resolve or reject randomly'
  })
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}

.button-group button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button-group button:hover {
  background: #0056b3;
}

.toast-info {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.toast-info h3 {
  margin-top: 0;
}

.toast-info ul {
  list-style: none;
  padding: 0;
}

.toast-info li {
  padding: 5px 0;
  border-bottom: 1px solid #dee2e6;
}

.toast-info li:last-child {
  border-bottom: none;
}
</style>
