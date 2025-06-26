import { BellIcon as BellIconOutline } from '@heroicons/react/24/outline'
import type { NotificationBatch, NotificationType } from '~/contexts/NotificationContext'
import NotificationSection from './NotificationSection'

interface NotificationsContentProps {
  filteredNotifications: NotificationBatch
  onNotificationClick: (notification: NotificationType) => void
  activeTab: 'all' | 'unread'
}

const NotificationsContent = ({
  filteredNotifications,
  onNotificationClick,
  activeTab,
}: NotificationsContentProps) => {
  const hasNotifications =
    filteredNotifications.yesterday.length > 0 ||
    filteredNotifications.thisWeek.length > 0 ||
    filteredNotifications.earlier.length > 0

  if (!hasNotifications) {
    return (
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
    )
  }

  return (
    <>
      <NotificationSection
        title="Yesterday"
        notifications={filteredNotifications.yesterday}
        onNotificationClick={onNotificationClick}
      />
      <NotificationSection
        title="This Week"
        notifications={filteredNotifications.thisWeek}
        onNotificationClick={onNotificationClick}
      />
      <NotificationSection
        title="Earlier"
        notifications={filteredNotifications.earlier}
        onNotificationClick={onNotificationClick}
      />
    </>
  )
}

export default NotificationsContent 