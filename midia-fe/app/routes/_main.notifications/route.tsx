import { MockNotificationProvider } from '~/routes/_main.notifications/elements/MockNotificationContext'
import { NotificationsPage } from '~/routes/_main.notifications/elements/NotificationsPage'

export default function NotificationsRoute() {
  return (
    <MockNotificationProvider>
      <NotificationsPage />
    </MockNotificationProvider>
  )
} 