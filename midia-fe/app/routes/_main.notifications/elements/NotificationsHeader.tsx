import { Button } from '@heroui/react'
import TabButton from './TabButton'

interface NotificationsHeaderProps {
  activeTab: 'all' | 'unread'
  setActiveTab: (tab: 'all' | 'unread') => void
  unreadCount: number
  onMarkAllAsRead: () => void
}

const NotificationsHeader = ({
  activeTab,
  setActiveTab,
  unreadCount,
  onMarkAllAsRead,
}: NotificationsHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="light"
              color="primary"
              onPress={onMarkAllAsRead}
              className="text-sm font-medium"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <TabButton isActive={activeTab === 'all'} onClick={() => setActiveTab('all')}>
            All
          </TabButton>
          <TabButton
            isActive={activeTab === 'unread'}
            onClick={() => setActiveTab('unread')}
          >
            Unread
          </TabButton>
        </div>
      </div>
    </div>
  )
}

export default NotificationsHeader 