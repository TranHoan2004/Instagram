import { useState, useMemo } from 'react'
import { Button, Spinner } from '@heroui/react'
import { BellIcon as BellIconOutline } from '@heroicons/react/24/outline'
import { useNotificationContext } from '~/contexts/NotificationContext'
import { useAuth } from '~/contexts/AuthContext'
import type { NotificationType } from '~/contexts/NotificationContext'
import NotificationsHeader from './NotificationsHeader'
import NotificationItem from './NotificationItem'

export const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [visibleCount, setVisibleCount] = useState(6)
  const { isAuthenticated } = useAuth()
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

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 6)
  }

  // Show authentication required message if not logged in
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 px-4">
        <BellIconOutline className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Sign in to view notifications
        </h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          You need to be logged in to access your notifications.
        </p>
        <Button 
          color="primary" 
          onPress={() => window.location.href = '/signin'}
        >
          Sign In
        </Button>
      </div>
    )
  }

  // Flatten all notifications and filter based on active tab
  const allNotifications = useMemo(() => {
    const flattened = [
      ...notifications.yesterday,
      ...notifications.thisWeek,
      ...notifications.earlier,
    ]
    
    // Sort by creation date (newest first)
    const sorted = flattened.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    if (activeTab === 'unread') {
      return sorted.filter((n) => !n.isRead)
    }
    return sorted
  }, [notifications, activeTab])

  const visibleNotifications = allNotifications.slice(0, visibleCount)
  const hasMoreNotifications = visibleCount < allNotifications.length

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
          {error.message?.includes('Access Denied') || error.message?.includes('UNAUTHENTICATED') 
            ? 'Please sign in to view notifications' 
            : error.message || 'Please check your connection and try again'}
        </p>
        {error.message?.includes('Access Denied') || error.message?.includes('UNAUTHENTICATED') ? (
          <Button color="primary" onPress={() => window.location.href = '/signin'}>
            Sign In
          </Button>
        ) : (
          <Button size="sm" variant="light" color="primary" onPress={handleRetry}>
            Try again
          </Button>
        )}
      </div>
    )
  }

  if (allNotifications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <NotificationsHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadCount}
          onMarkAllAsRead={markAllAsRead}
        />
        <div className="flex flex-col items-center justify-center min-h-96 px-4">
          <BellIconOutline className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-sm text-gray-500 text-center">
            {activeTab === 'unread'
              ? "You're all caught up!"
              : "When you get notifications, they'll show up here"}
          </p>
        </div>
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
        <div className="space-y-0">
          {visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <NotificationItem notification={notification} />
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {hasMoreNotifications && (
          <div className="mt-6 px-4">
            <Button
              variant="light"
              color="default"
              fullWidth
              size="lg"
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              onPress={handleShowMore}
            >
              See previous notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 