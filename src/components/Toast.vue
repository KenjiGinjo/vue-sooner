<template>
  <div
    v-if="!toast.delete"
    data-sonner-toast
    :data-styled="!toast.unstyled"
    :data-mounted="mounted"
    :data-promise="Boolean(toast.promise)"
    :data-removed="removed"
    :data-visible="mounted && !removed"
    :data-y-position="props.position?.split('-')[0] || 'bottom'"
    :data-x-position="props.position?.split('-')[1] || 'right'"
    :data-index="index"
    :data-front="index === 0"
    :data-swiping="swiping"
    :data-dismissible="toast.dismissible"
    :data-type="toast.type"
    :data-invert="props.invert"
    :data-swipe-out="swipeOut"
    :data-expanded="props.expanded"
    :data-interacting="props.interacting"
    :data-close-button="props.closeButton"
    :data-rich-colors="richColors"
    :data-rtl="props.dir === 'rtl'"
    :data-testid="toast.testId"
    :class="toastClassName"
    :style="toastStyle"
    @click="handleClick"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointerleave="handlePointerLeave"
  >
    <!-- Close Button -->
    <button
      v-if="props.closeButton"
      data-close-button
      :aria-label="props.closeButtonAriaLabel"
      :class="closeButtonClassName"
      :style="closeButtonStyle"
      @click="handleClose"
    >
      <slot name="close-icon">
        <CloseIcon />
      </slot>
    </button>

    <!-- Toast Content -->
    <div data-content>
      <!-- Icon -->
      <div v-if="toast.icon || (toast.type && getAsset(toast.type))" data-icon>
        <slot name="icon" :toast="toast">
          <component :is="toast.icon || (toast.type ? getAsset(toast.type) : null)" />
        </slot>
      </div>

      <!-- Title -->
      <div v-if="toast.title" data-title>
        <slot name="title" :toast="toast">
          {{ typeof toast.title === 'function' ? toast.title() : toast.title }}
        </slot>
      </div>

      <!-- Description -->
      <div v-if="toast.description" data-description :class="toast.descriptionClassName">
        <slot name="description" :toast="toast">
          {{ typeof toast.description === 'function' ? toast.description() : toast.description }}
        </slot>
      </div>

      <!-- Custom JSX -->
      <div v-if="toast.jsx" data-jsx>
        <component :is="toast.jsx" />
      </div>

      <!-- Action Buttons -->
      <div v-if="toast.action || toast.cancel" data-button-container>
        <button
          v-if="toast.cancel"
          data-button
          data-cancel
          :style="toast.cancelButtonStyle"
          :class="cancelButtonClassName"
          @click="handleCancel"
        >
          <slot name="cancel" :toast="toast">
            {{ isAction(toast.cancel) ? toast.cancel.label : toast.cancel }}
          </slot>
        </button>

        <button
          v-if="toast.action"
          data-button
          data-action
          :style="toast.actionButtonStyle"
          :class="actionButtonClassName"
          @click="handleAction"
        >
          <slot name="action" :toast="toast">
            {{ isAction(toast.action) ? toast.action.label : toast.action }}
          </slot>
        </button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="toast.type === 'loading'" data-loading>
      <slot name="loading-icon">
        <Loader :visible="true" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { ToastProps, ToastT, Action } from '../types'
import { getAsset, Loader, CloseIcon, isAction } from '../assets'
import { useToast } from '../composables/useToast'

const props = defineProps<ToastProps>()

const emit = defineEmits<{
  remove: [toast: ToastT]
}>()

const { dismiss } = useToast()

// Local state
const mounted = ref(false)
const removed = ref(false)
const swiping = ref(false)
const swipeOut = ref(false)
const interacting = ref(false)
const pointerStartX = ref(0)
const pointerStartY = ref(0)
const pointerDeltaX = ref(0)
const pointerDeltaY = ref(0)

// Computed properties
const toastClassName = computed(() => {
  const classes = ['sonner-toast']
  if (props.toast.className) classes.push(props.toast.className)
  if (props.className) classes.push(props.className)
  if (props.toast.classNames?.toast) classes.push(props.toast.classNames.toast)
  return classes.join(' ')
})

const toastStyle = computed(() => ({
  ...props.toast.style,
  ...props.style,
}))

const closeButtonClassName = computed(() => {
  const classes = ['sonner-close-button']
  if (props.toast.classNames?.closeButton) classes.push(props.toast.classNames.closeButton)
  return classes.join(' ')
})

const closeButtonStyle = computed(() => props.toast.style)

const cancelButtonClassName = computed(() => {
  const classes = ['sonner-cancel-button']
  if (props.toast.classNames?.cancelButton) classes.push(props.toast.classNames.cancelButton)
  return classes.join(' ')
})

const actionButtonClassName = computed(() => {
  const classes = ['sonner-action-button']
  if (props.toast.classNames?.actionButton) classes.push(props.toast.classNames.actionButton)
  return classes.join(' ')
})

const richColors = computed(() => props.toast.richColors ?? props.defaultRichColors ?? false)

// Methods
const handleClick = (event: MouseEvent) => {
  if (props.toast.dismissible === false) return
  if (event.target === event.currentTarget) {
    dismiss(props.toast.id)
  }
}

const handleClose = () => {
  dismiss(props.toast.id)
}

const handleCancel = (event: MouseEvent) => {
  if (isAction(props.toast.cancel!)) {
    props.toast.cancel.onClick(event)
  }
  dismiss(props.toast.id)
}

const handleAction = (event: MouseEvent) => {
  if (isAction(props.toast.action!)) {
    props.toast.action.onClick(event)
  }
}

const handlePointerDown = (event: PointerEvent) => {
  if (props.toast.dismissible === false) return
  
  swiping.value = true
  pointerStartX.value = event.clientX
  pointerStartY.value = event.clientY
  pointerDeltaX.value = 0
  pointerDeltaY.value = 0
}

const handlePointerMove = (event: PointerEvent) => {
  if (!swiping.value) return
  
  pointerDeltaX.value = event.clientX - pointerStartX.value
  pointerDeltaY.value = event.clientY - pointerStartY.value
  
  // Add swipe logic here if needed
}

const handlePointerUp = () => {
  if (!swiping.value) return
  
  swiping.value = false
  
  // Add swipe-to-dismiss logic here if needed
}

const handlePointerLeave = () => {
  if (swiping.value) {
    handlePointerUp()
  }
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  mounted.value = true
  
  // Auto dismiss timer
  if (props.toast.duration && props.toast.duration > 0) {
    setTimeout(() => {
      if (!removed.value) {
        dismiss(props.toast.id)
        props.toast.onAutoClose?.(props.toast)
      }
    }, props.toast.duration)
  }
})

onUnmounted(() => {
  removed.value = true
  props.toast.onDismiss?.(props.toast)
})
</script>
