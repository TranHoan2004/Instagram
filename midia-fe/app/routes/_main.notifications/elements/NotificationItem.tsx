import { Avatar, Button } from '@heroui/react'
import { useState } from 'react'
import type { NotificationType } from '~/contexts/NotificationContext'

interface NotificationItemProps {
	notification: NotificationType
}

const FollowNotification = ({ notification }: NotificationItemProps) => {
	const [isFollowing, setIsFollowing] = useState(false)
	const actorName = notification.actor.profile?.fullName || notification.actor.username
	const avatarUrl = notification.actor.profile?.avatarUrl || `https://i.pravatar.cc/150?u=${notification.actor.username}`

	const handleFollowClick = () => {
		setIsFollowing(!isFollowing)
		console.log('Follow button clicked for user:', notification.actor.id, 'New status:', !isFollowing ? 'following' : 'not following')
	}

	return (
		<>
			<Avatar
				src={avatarUrl}
				className="size-11 flex-shrink-0"
				radius="full"
			/>
			<div className="flex-grow min-w-0">
				<span className="font-semibold text-sm">
					{actorName}
				</span>{' '}
				<span className="text-sm">started following you.</span>{' '}
				<span className="text-sm text-neutral-500">{notification.time}</span>
			</div>
			<Button
				size="sm"
				radius="sm"
				className={`font-semibold px-5 flex-shrink-0 ${isFollowing
						? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
						: 'bg-primary text-white'
					}`}
				onPress={handleFollowClick}
			>
				{isFollowing ? 'Following' : 'Follow'}
			</Button>
		</>
	)
}

const LikeNotification = ({ notification }: NotificationItemProps) => {
	const actorName = notification.actor.profile?.fullName || notification.actor.username
	const avatarUrl = notification.actor.profile?.avatarUrl || `https://i.pravatar.cc/150?u=${notification.actor.username}`
	const postImageUrl = notification.post?.imageUrls?.[0] || 'https://via.placeholder.com/150'

	return (
		<>
			<Avatar
				src={avatarUrl}
				className="size-11 flex-shrink-0"
				radius="full"
			/>
			<div className="flex-grow text-sm min-w-0">
				<span className="font-semibold">
					{actorName}
				</span>{' '}
				liked your post.{' '}
				<span className="text-neutral-500">{notification.time}</span>
			</div>
			<div className="relative size-11 flex-shrink-0">
				<Avatar
					src={postImageUrl}
					className="size-11 rounded-lg"
					radius="sm"
				/>
			</div>
		</>
	)
}

const CommentNotification = ({ notification }: NotificationItemProps) => {
	const actorName = notification.actor.profile?.fullName || notification.actor.username
	const avatarUrl = notification.actor.profile?.avatarUrl || `https://i.pravatar.cc/150?u=${notification.actor.username}`
	const postImageUrl = notification.post?.imageUrls?.[0] || 'https://via.placeholder.com/150'

	return (
		<>
			<Avatar
				src={avatarUrl}
				className="size-11 flex-shrink-0"
				radius="full"
			/>
			<div className="flex-grow text-sm min-w-0">
				<span className="font-semibold">
					{actorName}
				</span>{' '}
				commented on your post.{' '}
				<span className="text-neutral-500">{notification.time}</span>
			</div>
			{notification.post && (
				<div className="relative size-11 flex-shrink-0">
					<Avatar
						src={postImageUrl}
						className="size-11 rounded-lg"
						radius="sm"
					/>
				</div>
			)}
		</>
	)
}

const MentionNotification = ({ notification }: NotificationItemProps) => {
	const actorName = notification.actor.profile?.fullName || notification.actor.username
	const avatarUrl = notification.actor.profile?.avatarUrl || `https://i.pravatar.cc/150?u=${notification.actor.username}`
	const postImageUrl = notification.post?.imageUrls?.[0] || 'https://via.placeholder.com/150'

	return (
		<>
			<Avatar
				src={avatarUrl}
				className="size-11 flex-shrink-0"
				radius="full"
			/>
			<div className="flex-grow text-sm min-w-0">
				<span className="font-semibold">
					{actorName}
				</span>{' '}
				mentioned you in a post.{' '}
				<span className="text-neutral-500">{notification.time}</span>
			</div>
			{notification.post && (
				<div className="relative size-11 flex-shrink-0">
					<Avatar
						src={postImageUrl}
						className="size-11 rounded-lg"
						radius="sm"
					/>
				</div>
			)}
		</>
	)
}

// Legacy notification types for backward compatibility
const SuggestionNotification = ({ notification }: NotificationItemProps) => {
	return (
		<>
			<Avatar
				src="https://via.placeholder.com/150"
				className="size-11 flex-shrink-0"
				radius="full"
			/>
			<div className="flex-grow text-sm">
				{notification.message}{' '}
				<span className="text-neutral-500">{notification.time}</span>
			</div>
		</>
	)
}

const NotificationItem = ({ notification }: NotificationItemProps) => {
	const renderNotificationContent = () => {
		switch (notification.type) {
			case 'FOLLOW':
				return <FollowNotification notification={notification} />
			case 'LIKE':
				return <LikeNotification notification={notification} />
			case 'COMMENT':
				return <CommentNotification notification={notification} />
			case 'MENTION':
				return <MentionNotification notification={notification} />
			// Legacy types for backward compatibility
			case 'follow':
				return <FollowNotification notification={notification} />
			case 'like':
				return <LikeNotification notification={notification} />
			case 'suggestion':
				return <SuggestionNotification notification={notification} />
			default: {
				// Generic notification renderer
				const actorName = notification.actor?.profile?.fullName || notification.actor?.username || 'Someone'
				const avatarUrl = notification.actor?.profile?.avatarUrl || `https://i.pravatar.cc/150?u=${actorName}`

				return (
					<>
						<Avatar
							src={avatarUrl}
							className="size-11 flex-shrink-0"
							radius="full"
						/>
						<div className="flex-grow text-sm min-w-0">
							<span className="font-semibold">
								{actorName}
							</span>{' '}
							{notification.message}{' '}
							<span className="text-neutral-500">{notification.time}</span>
						</div>
					</>
				)
			}
		}
	}

	return (
		<div className="flex items-center gap-3 w-full">
			{renderNotificationContent()}
		</div>
	)
}

export default NotificationItem 