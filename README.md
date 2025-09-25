# Vue 3 Toast Component

一个基于Vue 3的现代化toast通知组件，提供丰富的功能和优雅的用户体验。

## 特性

- 🚀 **Vue 3 支持** - 完全基于Vue 3 Composition API
- 🎨 **多种样式** - 支持success、error、warning、info、loading等类型
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🎯 **TypeScript** - 完整的类型支持
- 🎪 **动画效果** - 流畅的进入和退出动画
- 🔧 **高度可定制** - 支持自定义样式、位置、持续时间等
- 📦 **轻量级** - 无额外依赖，体积小巧
- 🎨 **主题支持** - 支持明暗主题切换

## 安装

```bash
npm install vue-sooner
# 或
yarn add vue-sooner
# 或
pnpm add vue-sooner
```

## 快速开始

### 1. 全局注册

```typescript
import { createApp } from 'vue'
import { createVueToast } from 'vue-sooner'
import App from './App.vue'

const app = createApp(App)
app.use(createVueToast())
app.mount('#app')
```

### 2. 在组件中使用

```vue
<template>
  <div>
    <button @click="showSuccess">显示成功提示</button>
    <button @click="showError">显示错误提示</button>

    <!-- Toast容器 -->
    <VueToast />
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-sooner'

const { success, error } = useToast()

const showSuccess = () => {
  success('操作成功！', {
    description: '您的更改已保存',
    duration: 3000
  })
}

const showError = () => {
  error('操作失败！', {
    description: '请稍后重试',
    duration: 5000
  })
}
</script>
```

## API 参考

### useToast Composable

```typescript
const {
  toast, // 基础toast方法
  success, // 成功toast
  error, // 错误toast
  info, // 信息toast
  warning, // 警告toast
  loading, // 加载toast
  custom, // 自定义toast
  promise, // Promise toast
  dismiss, // 关闭指定toast
  dismissAll, // 关闭所有toast
  toasts, // 当前活跃的toast列表
  history // toast历史记录
} = useToast()
```

### Toast 配置选项

```typescript
interface ToastOptions {
  id?: string | number
  title?: string | VNode
  description?: string | VNode
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default'
  duration?: number
  dismissible?: boolean
  closeButton?: boolean
  action?: Action
  cancel?: Action
  className?: string
  style?: Record<string, any>
  onDismiss?: (toast: ToastT) => void
  onAutoClose?: (toast: ToastT) => void
}
```

### Toaster 组件属性

```typescript
interface ToasterProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
  theme?: 'light' | 'dark' | 'system'
  duration?: number
  gap?: number
  visibleToasts?: number
  closeButton?: boolean
  richColors?: boolean
  expand?: boolean
  className?: string
  style?: Record<string, any>
  offset?: Offset
  mobileOffset?: Offset
  dir?: 'rtl' | 'ltr' | 'auto'
  swipeDirections?: SwipeDirection[]
  hotkey?: string[]
  containerAriaLabel?: string
}
```

## 使用示例

### 基础用法

```vue
<template>
  <div>
    <button @click="showBasic">基础提示</button>
    <VueToast />
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-sooner'

const { toast } = useToast()

const showBasic = () => {
  toast('这是一个基础提示')
}
</script>
```

### 不同类型的Toast

```vue
<script setup lang="ts">
import { useToast } from 'vue-sooner'

const { success, error, info, warning, loading } = useToast()

// 成功提示
const showSuccess = () => {
  success('操作成功！', {
    description: '数据已保存到服务器'
  })
}

// 错误提示
const showError = () => {
  error('操作失败！', {
    description: '请检查网络连接后重试'
  })
}

// 信息提示
const showInfo = () => {
  info('新消息', {
    description: '您有3条未读消息'
  })
}

// 警告提示
const showWarning = () => {
  warning('注意', {
    description: '此操作不可撤销'
  })
}

// 加载提示
const showLoading = () => {
  loading('处理中...', {
    description: '请稍候'
  })
}
</script>
```

### 带操作的Toast

```vue
<script setup lang="ts">
import { useToast } from 'vue-sooner'

const { toast } = useToast()

const showActionToast = () => {
  toast('文件已删除', {
    action: {
      label: '撤销',
      onClick: () => {
        console.log('撤销删除')
      }
    },
    cancel: {
      label: '取消',
      onClick: () => {
        console.log('取消操作')
      }
    }
  })
}
</script>
```

### Promise Toast

```vue
<script setup lang="ts">
import { useToast } from 'vue-sooner'

const { promise } = useToast()

const handleAsyncOperation = async () => {
  const apiCall = fetch('/api/data')

  promise(apiCall, {
    loading: '正在加载数据...',
    success: (data) => `数据加载成功！共${data.length}条记录`,
    error: (error) => `加载失败：${error.message}`
  })
}
</script>
```

### 自定义Toast

```vue
<script setup lang="ts">
import { h } from 'vue'
import { useToast } from 'vue-sooner'

const { custom } = useToast()

const showCustomToast = () => {
  custom((id) => {
    return h('div', { class: 'custom-toast' }, [
      h('h4', '自定义标题'),
      h('p', '这是自定义内容的toast')
    ])
  })
}
</script>
```

### 配置Toaster

```vue
<template>
  <VueToast
    position="top-right"
    theme="dark"
    :duration="5000"
    :gap="12"
    :visible-toasts="5"
    :close-button="true"
    :rich-colors="true"
    :expand="true"
    class="my-toaster"
  />
</template>
```

## 样式定制

### CSS变量

```css
[data-sonner-toaster] {
  --width: 400px;
  --gap: 12px;
  --border-radius: 8px;
}

[data-sonner-toast] {
  --normal-bg: #ffffff;
  --normal-text: #000000;
  --success-bg: #f0f9ff;
  --success-text: #0c4a6e;
  --error-bg: #fef2f2;
  --error-text: #991b1b;
}
```

### 自定义类名

```vue
<template>
  <VueToast
    class="my-custom-toaster"
    :toast-options="{
      className: 'my-toast',
      classNames: {
        toast: 'custom-toast',
        title: 'custom-title',
        description: 'custom-description'
      }
    }"
  />
</template>
```

## 最佳实践

1. **合理使用Toast类型**
   - 成功操作使用 `success`
   - 错误信息使用 `error`
   - 一般信息使用 `info`
   - 警告信息使用 `warning`

2. **控制Toast数量**
   - 设置合理的 `visibleToasts` 数量
   - 避免同时显示过多Toast

3. **设置合适的持续时间**
   - 重要信息设置较长持续时间
   - 一般提示使用默认时间
   - 加载状态使用 `duration: 0` 不自动关闭

4. **提供清晰的操作**
   - 为重要操作提供撤销功能
   - 使用描述性文本说明操作结果

5. **响应式设计**
   - 在移动端调整Toast大小和位置
   - 使用 `mobileOffset` 配置移动端偏移

## 许可证

MIT License
