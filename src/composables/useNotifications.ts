import { ref, computed } from 'vue'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  read: boolean
  actionUrl?: string
}

const notifications = ref<Notification[]>([])

export function useNotifications() {
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    }
    
    notifications.value.unshift(newNotification)
    
    // Limit to 50 notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
    
    // Save to localStorage
    saveNotifications()
  }

  const markAsRead = (notificationId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      saveNotifications()
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
    saveNotifications()
  }

  const deleteNotification = (notificationId: string) => {
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
    saveNotifications()
  }

  const clearAllNotifications = () => {
    notifications.value = []
    saveNotifications()
  }

  const saveNotifications = () => {
    localStorage.setItem('portfolio_notifications', JSON.stringify(notifications.value))
  }

  const loadNotifications = () => {
    const saved = localStorage.getItem('portfolio_notifications')
    if (saved) {
      try {
        notifications.value = JSON.parse(saved)
      } catch (error) {
        console.error('Error loading notifications:', error)
        notifications.value = []
      }
    }
  }

  // Auto-generate some demo notifications on first load
  const initDemoNotifications = () => {
    if (notifications.value.length === 0) {
      addNotification({
        title: 'Bienvenue sur TrackerPro!',
        message: 'Votre portefeuille est maintenant configuré et prêt à être utilisé.',
        type: 'success'
      })
      
      addNotification({
        title: 'Mise à jour des prix',
        message: 'Les prix de vos cryptomonnaies ont été mis à jour avec succès.',
        type: 'info'
      })
      
      addNotification({
        title: 'Conseil de diversification',
        message: 'Votre portefeuille pourrait bénéficier d\'une meilleure diversification.',
        type: 'warning'
      })
    }
  }

  return {
    notifications: computed(() => notifications.value),
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    loadNotifications,
    initDemoNotifications
  }
}