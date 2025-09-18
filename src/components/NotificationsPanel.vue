<template>
  <div class="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md border border-light-border dark:border-dark-border">
    <div class="p-4 border-b border-light-border dark:border-dark-border">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Notifications</h3>
        <div class="flex items-center space-x-2">
          <button 
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-sm text-accent hover:underline"
          >
            Tout marquer lu
          </button>
          <button 
            @click="$emit('close')"
            class="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div v-if="unreadCount > 0" class="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
        {{ unreadCount }} notification{{ unreadCount > 1 ? 's' : '' }} non lue{{ unreadCount > 1 ? 's' : '' }}
      </div>
    </div>

    <div class="max-h-96 overflow-y-auto">
      <div v-if="notifications.length === 0" class="p-6 text-center text-light-text-secondary dark:text-dark-text-secondary">
        <BellSlashIcon class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Aucune notification</p>
      </div>

      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'p-4 border-b border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-bg transition-colors',
          !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
        ]"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <div 
                :class="[
                  'w-2 h-2 rounded-full flex-shrink-0',
                  getNotificationColor(notification.type)
                ]"
              ></div>
              <h4 
                :class="[
                  'font-semibold text-sm truncate',
                  !notification.read ? 'text-light-text-main dark:text-dark-text-main' : 'text-light-text-secondary dark:text-dark-text-secondary'
                ]"
              >
                {{ notification.title }}
              </h4>
              <span v-if="!notification.read" class="w-2 h-2 bg-accent rounded-full flex-shrink-0"></span>
            </div>
            
            <p class="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 line-clamp-2">
              {{ notification.message }}
            </p>
            
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {{ formatTime(notification.timestamp) }}
              </span>
              
              <div class="flex items-center space-x-1">
                <button 
                  v-if="!notification.read"
                  @click="markAsRead(notification.id)"
                  class="text-xs text-accent hover:underline"
                >
                  Marquer lu
                </button>
                <button 
                  @click="deleteNotification(notification.id)"
                  class="p-1 text-gray-400 hover:text-red-500 rounded"
                >
                  <TrashIcon class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="notifications.length > 0" class="p-4 border-t border-light-border dark:border-dark-border">
      <button 
        @click="clearAllNotifications"
        class="w-full text-sm text-red-500 hover:text-red-700 font-medium"
      >
        Effacer toutes les notifications
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'

import { 
  XMarkIcon, 
  TrashIcon, 
  BellSlashIcon 
} from '@heroicons/vue/24/outline'

dayjs.extend(relativeTime)
dayjs.locale('fr')

const emit = defineEmits<{
  close: []
}>()

const { 
  notifications, 
  unreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  clearAllNotifications,
  loadNotifications,
  initDemoNotifications
} = useNotifications()

onMounted(() => {
  loadNotifications()
  initDemoNotifications()
})

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success': return 'bg-green-500'
    case 'warning': return 'bg-yellow-500'
    case 'error': return 'bg-red-500'
    default: return 'bg-blue-500'
  }
}

const formatTime = (timestamp: string) => {
  return dayjs(timestamp).fromNow()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>