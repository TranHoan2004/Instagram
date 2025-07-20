import { BellIcon as BellIconOutline } from '@heroicons/react/24/outline'
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid'
import {
	Badge,
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownSection,
	DropdownTrigger,
	Spinner
} from '@heroui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useNotificationContext } from '~/contexts/NotificationContext'
import { useAuth } from '~/contexts/AuthContext'
import NotificationItem from './NotificationItem'

const NotificationDropdown = () => {
	const [isOpen, setIsOpen] = useState(false)
	const navigate = useNavigate()
	const { isAuthenticated } = useAuth()
	const { 
		notifications, 
		unreadCount, 
		loading, 
		error, 
		markAsRead, 
		markAllAsRead,
		refetch 
	} = useNotificationContext()

	const handleNotificationClick = async (key: string | number) => {
		try {
			const notificationId = String(key)
			await markAsRead(notificationId)
		} catch (error) {
			// Error handling is done in the context
			console.error('Error handled in context:', error)
		}
	}

	const handleMarkAllAsRead = async () => {
		try {
			await markAllAsRead()
		} catch (error) {
			// Error handling is done in the context
			console.error('Error handled in context:', error)
		}
	}

	const handleRetry = async () => {
		try {
			await refetch()
		} catch (error) {
			console.error('Error retrying:', error)
		}
	}

	const handleViewAll = () => {
		navigate('/notifications')
		setIsOpen(false)
	}

	const handleSignIn = () => {
		navigate('/signin')
		setIsOpen(false)
	}

	return (
		<Dropdown onOpenChange={setIsOpen}>
			<DropdownTrigger>
				<Button
					isIconOnly
					aria-label="Notifications"
					variant="bordered"
					radius="full"
					className="border border-foreground-400 relative"
				>
					{isOpen ? (
						<BellIconSolid className="size-6 text-black dark:text-white" />
					) : (
						<BellIconOutline className="size-6 text-gray-400" />
					)}
					{unreadCount > 0 && !loading && !error && isAuthenticated && (
						<Badge
							color="danger"
							size="sm"
							content={unreadCount > 99 ? '99+' : unreadCount}
							className="absolute -top-1 -right-0 min-w-4 min-h-4 flex items-center justify-center"
						>
							<span className="sr-only">Unread notifications</span>
						</Badge>
					)}
				</Button>
			</DropdownTrigger>
			<DropdownMenu
				aria-label="Notifications"
				className="w-[25rem] max-h-[38rem] overflow-y-auto"
				disableAnimation
			>
				<DropdownSection>
					<DropdownItem key="header" isReadOnly className="opacity-100 cursor-default data-[hover=true]:bg-transparent">
						<div className="px-2 py-2 flex justify-between items-center">
							<h1 className="text-2xl font-bold font-roboto">Notifications</h1>
							<div className="flex items-center gap-2">
								{isAuthenticated && unreadCount > 0 && !error && (
									<Button
										size="sm"
										variant="light"
										color="primary"
										onPress={handleMarkAllAsRead}
										className="text-xs"
									>
										Mark all as read
									</Button>
								)}
								{isAuthenticated ? (
									<Button
										size="sm"
										variant="light"
										color="primary"
										onPress={handleViewAll}
										className="text-xs font-medium"
									>
										View all
									</Button>
								) : (
									<Button
										size="sm"
										variant="light"
										color="primary"
										onPress={handleSignIn}
										className="text-xs font-medium"
									>
										Sign In
									</Button>
								)}
							</div>
						</div>
					</DropdownItem>
				</DropdownSection>

				{!isAuthenticated ? (
					<DropdownSection>
						<DropdownItem key="unauthenticated" isReadOnly className="opacity-100 cursor-default">
							<div className="text-center py-8 text-gray-500">
								<BellIconOutline className="size-12 mx-auto mb-2 opacity-30" />
								<p className="text-sm mb-2">Sign in to view notifications</p>
								<Button
									size="sm"
									color="primary"
									onPress={handleSignIn}
									className="text-xs"
								>
									Sign In
								</Button>
							</div>
						</DropdownItem>
					</DropdownSection>
				) : loading ? (
					<DropdownSection>
						<DropdownItem key="loading" isReadOnly className="opacity-100 cursor-default">
							<div className="flex justify-center py-8">
								<Spinner size="lg" />
							</div>
						</DropdownItem>
					</DropdownSection>
				) : error ? (
					<DropdownSection>
						<DropdownItem key="error" isReadOnly className="opacity-100 cursor-default">
							<div className="text-center py-8 text-red-500">
								<BellIconOutline className="size-12 mx-auto mb-2 opacity-30" />
								<p className="text-sm">Unable to load notifications</p>
								<p className="text-xs text-gray-400 mt-1">
									{error.message?.includes('Access Denied') || error.message?.includes('UNAUTHENTICATED')
										? 'Please sign in to view notifications'
										: error.message || 'Please check your connection and try again'}
								</p>
								{error.message?.includes('Access Denied') || error.message?.includes('UNAUTHENTICATED') ? (
									<Button
										size="sm"
										color="primary"
										onPress={handleSignIn}
										className="text-xs mt-2"
									>
										Sign In
									</Button>
								) : (
									<Button
										size="sm"
										variant="light"
										color="primary"
										onPress={handleRetry}
										className="text-xs mt-2"
									>
										Retry
									</Button>
								)}
							</div>
						</DropdownItem>
					</DropdownSection>
				) : (
					<>
						{notifications.yesterday.length > 0 && (
							<DropdownSection title="Yesterday" className="mb-0">
								{notifications.yesterday.map((notification) => (
									<DropdownItem
										key={notification.id}
										isReadOnly={notification.type === 'FOLLOW'}
										className={`py-3 px-4 data-[hover=true]:bg-neutral-100 dark:data-[hover=true]:bg-neutral-700 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
											}`}
										textValue={`${notification.actor.profile?.fullName || notification.actor.username} ${notification.message}`}
										onPress={notification.type === 'FOLLOW' ? undefined : () => handleNotificationClick(notification.id)}
									>
										<NotificationItem notification={notification} />
									</DropdownItem>
								))}
							</DropdownSection>
						)}

						{notifications.thisWeek.length > 0 && (
							<DropdownSection title="This Week" className="mb-0">
								{notifications.thisWeek.map((notification) => (
									<DropdownItem
										key={notification.id}
										isReadOnly={notification.type === 'FOLLOW'}
										className={`py-3 px-4 data-[hover=true]:bg-neutral-100 dark:data-[hover=true]:bg-neutral-700 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
											}`}
										textValue={`${notification.actor.profile?.fullName || notification.actor.username} ${notification.message}`}
										onPress={notification.type === 'FOLLOW' ? undefined : () => handleNotificationClick(notification.id)}
									>
										<NotificationItem notification={notification} />
									</DropdownItem>
								))}
							</DropdownSection>
						)}

						{notifications.earlier.length > 0 && (
							<DropdownSection title="Earlier" className="mb-0">
								{notifications.earlier.map((notification) => (
									<DropdownItem
										key={notification.id}
										isReadOnly={notification.type === 'FOLLOW'}
										className={`py-3 px-4 data-[hover=true]:bg-neutral-100 dark:data-[hover=true]:bg-neutral-700 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
											}`}
										textValue={`${notification.actor.profile?.fullName || notification.actor.username} ${notification.message}`}
										onPress={notification.type === 'FOLLOW' ? undefined : () => handleNotificationClick(notification.id)}
									>
										<NotificationItem notification={notification} />
									</DropdownItem>
								))}
							</DropdownSection>
						)}

						{notifications.yesterday.length === 0 && 
						 notifications.thisWeek.length === 0 && 
						 notifications.earlier.length === 0 && (
							<DropdownSection>
								<DropdownItem key="empty" isReadOnly className="opacity-100 cursor-default">
									<div className="text-center py-8 text-gray-500">
										<BellIconOutline className="size-12 mx-auto mb-2 opacity-30" />
										<p>No notifications yet</p>
									</div>
								</DropdownItem>
							</DropdownSection>
						)}
					</>
				)}
			</DropdownMenu>
		</Dropdown>
	)
}

export default NotificationDropdown 