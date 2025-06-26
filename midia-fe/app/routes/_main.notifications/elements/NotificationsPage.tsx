import { useState } from 'react'
import { Button, Spinner } from '@heroui/react'
import { BellIcon as BellIconOutline } from '@heroicons/react/24/outline'
import { useMockNotificationContext as useNotificationContext } from '~/routes/_main.notifications/elements/MockNotificationContext'
import type { NotificationType } from '~/contexts/NotificationContext'
import NotificationsHeader from './NotificationsHeader'
import NotificationsContent from './NotificationsContent'

export const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotificationContext()

  const handleNotificationClick = async (notification: NotificationType) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id)
      } catch (err) {
        console.error('Error marking notification as read:', err)
      }
    }
    // Navigate to post or profile if needed
    console.log('Notification clicked:', notification)
  }

  const handleRetry = async () => {
    try {
      await refetch()
    } catch (err) {
      console.error('Error retrying:', err)
    }
  }

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    if (activeTab === 'unread') {
      return {
        yesterday: notifications.yesterday.filter((n) => !n.isRead),
        thisWeek: notifications.thisWeek.filter((n) => !n.isRead),
        earlier: notifications.earlier.filter((n) => !n.isRead),
      }
    }
    return notifications
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 px-4">
        <BellIconOutline className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Unable to load notifications
        </h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          {error.message ||
            error.networkError?.message ||
            'Please check your connection and try again'}
        </p>
        <Button size="sm" variant="light" color="primary" onPress={handleRetry}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <NotificationsHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllAsRead}
      />

      {/* Content */}
      <div className="py-4">
        <NotificationsContent
          filteredNotifications={getFilteredNotifications()}
          onNotificationClick={handleNotificationClick}
          activeTab={activeTab}
        />
      </div>
    </div>
  )
} 