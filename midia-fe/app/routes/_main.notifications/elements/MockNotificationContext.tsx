import { createContext, use, useCallback, useMemo, useState } from 'react'
import type { NotificationType } from '~/contexts/NotificationContext'
import { NotificationType as BackendNotificationType } from '~/lib/graphql-types'

interface NotificationBatch {
  yesterday: NotificationType[]
  thisWeek: NotificationType[]
  earlier: NotificationType[]
}

interface NotificationError {
  message: string
  code?: string
}

interface NotificationContextType {
  notifications: NotificationBatch
  unreadCount: number
  loading: boolean
  error: NotificationError | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refetch: () => Promise<void>
}

const MockNotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Mock data
const mockNotifications: NotificationBatch = {
  yesterday: [
    {
      id: '1',
      type: BackendNotificationType.FOLLOW,
      message: 'started following you',
      isRead: false,
      createdAt: '2024-01-20T14:30:00Z',
      time: '5h',
      actor: {
        id: 'user1',
        username: 'sarah_jones',
        profile: {
          userID: 'user1',
          avatarUrl: 'https://i.pravatar.cc/150?u=sarah_jones',
          fullName: 'Sarah Jones',
        },
      },
      post: null,
    },
    {
      id: '2',
      type: BackendNotificationType.LIKE,
      message: 'liked your post',
      isRead: false,
      createdAt: '2024-01-20T12:15:00Z',
      time: '7h',
      actor: {
        id: 'user2',
        username: 'mike_wilson',
        profile: {
          userID: 'user2',
          avatarUrl: 'https://i.pravatar.cc/150?u=mike_wilson',
          fullName: 'Mike Wilson',
        },
      },
      post: {
        id: 'post1',
        caption: 'Beautiful sunset at the beach!',
        imageUrls: ['https://picsum.photos/400/400?random=1'],
      },
    },
    {
      id: '3',
      type: BackendNotificationType.COMMENT,
      message: 'commented on your post',
      isRead: true,
      createdAt: '2024-01-20T10:45:00Z',
      time: '9h',
      actor: {
        id: 'user3',
        username: 'emma_davis',
        profile: {
          userID: 'user3',
          avatarUrl: 'https://i.pravatar.cc/150?u=emma_davis',
          fullName: 'Emma Davis',
        },
      },
      post: {
        id: 'post2',
        caption: 'Coffee time ☕',
        imageUrls: ['https://picsum.photos/400/400?random=2'],
      },
    },
  ],
  thisWeek: [
    {
      id: '4',
      type: BackendNotificationType.MENTION,
      message: 'mentioned you in a post',
      isRead: true,
      createdAt: '2024-01-18T16:20:00Z',
      time: '2d',
      actor: {
        id: 'user4',
        username: 'alex_brown',
        profile: {
          userID: 'user4',
          avatarUrl: 'https://i.pravatar.cc/150?u=alex_brown',
          fullName: 'Alex Brown',
        },
      },
      post: {
        id: 'post3',
        caption: 'Great workout session today!',
        imageUrls: ['https://picsum.photos/400/400?random=3'],
      },
    },
    {
      id: '5',
      type: BackendNotificationType.FOLLOW,
      message: 'started following you',
      isRead: false,
      createdAt: '2024-01-17T11:30:00Z',
      time: '3d',
      actor: {
        id: 'user5',
        username: 'lisa_taylor',
        profile: {
          userID: 'user5',
          avatarUrl: 'https://i.pravatar.cc/150?u=lisa_taylor',
          fullName: 'Lisa Taylor',
        },
      },
      post: null,
    },
    {
      id: '6',
      type: BackendNotificationType.LIKE,
      message: 'liked your post',
      isRead: true,
      createdAt: '2024-01-16T09:15:00Z',
      time: '4d',
      actor: {
        id: 'user6',
        username: 'john_smith',
        profile: {
          userID: 'user6',
          avatarUrl: 'https://i.pravatar.cc/150?u=john_smith',
          fullName: 'John Smith',
        },
      },
      post: {
        id: 'post4',
        caption: 'Weekend vibes 🌊',
        imageUrls: ['https://picsum.photos/400/400?random=4'],
      },
    },
  ],
  earlier: [
    {
      id: '7',
      type: BackendNotificationType.COMMENT,
      message: 'commented on your post',
      isRead: true,
      createdAt: '2024-01-10T14:22:00Z',
      time: '1w',
      actor: {
        id: 'user7',
        username: 'kate_moore',
        profile: {
          userID: 'user7',
          avatarUrl: 'https://i.pravatar.cc/150?u=kate_moore',
          fullName: 'Kate Moore',
        },
      },
      post: {
        id: 'post5',
        caption: 'Delicious homemade pasta 🍝',
        imageUrls: ['https://picsum.photos/400/400?random=5'],
      },
    },
    {
      id: '8',
      type: BackendNotificationType.FOLLOW,
      message: 'started following you',
      isRead: true,
      createdAt: '2024-01-08T18:45:00Z',
      time: '1w',
      actor: {
        id: 'user8',
        username: 'david_lee',
        profile: {
          userID: 'user8',
          avatarUrl: 'https://i.pravatar.cc/150?u=david_lee',
          fullName: 'David Lee',
        },
      },
      post: null,
    },
  ],
}

interface MockNotificationProviderProps {
  children: React.ReactNode
}

export const MockNotificationProvider = ({ children }: MockNotificationProviderProps) => {
  const [notifications, setNotifications] = useState<NotificationBatch>(mockNotifications)
  const [loading] = useState(false)
  const [error] = useState<NotificationError | null>(null)

  // Calculate unread count
  const unreadCount = useMemo(() => {
    const allNotifications = [
      ...notifications.yesterday,
      ...notifications.thisWeek,
      ...notifications.earlier,
    ]
    return allNotifications.filter(notification => !notification.isRead).length
  }, [notifications])

  const markAsRead = useCallback(async (id: string) => {
    console.log('Mock: Marking notification as read:', id)
    setNotifications(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(section => {
        updated[section as keyof NotificationBatch] = updated[section as keyof NotificationBatch].map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      })
      return updated
    })
  }, [])

  const markAllAsRead = useCallback(async () => {
    console.log('Mock: Marking all notifications as read')
    setNotifications(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(section => {
        updated[section as keyof NotificationBatch] = updated[section as keyof NotificationBatch].map(notification => ({
          ...notification,
          isRead: true
        }))
      })
      return updated
    })
  }, [])

  const refetch = useCallback(async () => {
    console.log('Mock: Refetching notifications')
    // In a real implementation, this would refetch from the API
    return Promise.resolve()
  }, [])

  const contextValue = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch
  }), [notifications, unreadCount, loading, error, markAsRead, markAllAsRead, refetch])

  return (
    <MockNotificationContext.Provider value={contextValue}>
      {children}
    </MockNotificationContext.Provider>
  )
}

export const useMockNotificationContext = () => {
  const context = use(MockNotificationContext)
  if (!context) {
    throw new Error('useMockNotificationContext must be used within a MockNotificationProvider')
  }
  return context
}