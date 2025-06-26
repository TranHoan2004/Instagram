import NotificationItem from './NotificationItem'
import type { NotificationType } from '~/contexts/NotificationContext'

interface NotificationSectionProps {
	title: string
	notifications: NotificationType[]
	onNotificationClick: (notification: NotificationType) => void
}

const NotificationSection = ({
	title,
	notifications,
	onNotificationClick,
}: NotificationSectionProps) => {
	if (notifications.length === 0) return null

	return (
		<div className="mb-6">
			<h2 className="text-base font-bold mb-4 px-4">{title}</h2>
			<div className="space-y-0">
				{notifications.map((notification) => (
					<div
						key={notification.id}
						className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
							!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
						}`}
						onClick={() => onNotificationClick(notification)}
					>
						<NotificationItem notification={notification} />
					</div>
				))}
			</div>
		</div>
	)
}

export default NotificationSection 