import NotificationSection from './NotificationSection'
import { useNotificationContext } from '~/contexts/NotificationContext'
import { Spinner } from '@heroui/react'
import type { NotificationType } from '~/contexts/NotificationContext'

const NotificationList = () => {
	const { notifications, loading, error, markAsRead } = useNotificationContext()

	const handleNotificationClick = async (notification: NotificationType) => {
		if (!notification.isRead) {
			await markAsRead(notification.id)
		}
		console.log('Notification clicked:', notification.id)
	}

	if (loading) {
		return (
			<div className="flex justify-center py-8">
				<Spinner size="lg" />
			</div>
		)
	}

	if (error) {
		return (
			<div className="text-red-500 text-center py-8">
				Error loading notifications: {error.message}
			</div>
		)
	}

	const hasNotifications = notifications.yesterday.length > 0 || 
		notifications.thisWeek.length > 0 || 
		notifications.earlier.length > 0

	if (!hasNotifications) {
		return (
			<div className="text-center py-8 text-gray-500">
				<p>No notifications yet</p>
			</div>
		)
	}

	return (
		<div className="divide-y divide-neutral-200 dark:divide-neutral-700">
			{notifications.yesterday.length > 0 && (
				<NotificationSection
					title="Yesterday"
					notifications={notifications.yesterday}
					onNotificationClick={handleNotificationClick}
				/>
			)}
			{notifications.thisWeek.length > 0 && (
				<NotificationSection
					title="This Week"
					notifications={notifications.thisWeek}
					onNotificationClick={handleNotificationClick}
				/>
			)}
			{notifications.earlier.length > 0 && (
				<NotificationSection
					title="Earlier"
					notifications={notifications.earlier}
					onNotificationClick={handleNotificationClick}
				/>
			)}
		</div>
	)
}

export default NotificationList 