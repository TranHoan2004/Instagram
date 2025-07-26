import type { LoaderFunction } from 'react-router'
import { requireAuth } from '~/.server/auth'
import { useAuth } from '~/contexts/AuthContext'
import InitialSuggestUsers from './InitialSugestUsers'
import NewsFeed from './NewsFeed'
import Loading from '~/components/ui/Loading'

export const loader: LoaderFunction = async ({ request }) => {
  await requireAuth(request)
}

const NewsFeedPage = () => {
  const { user, loading, error } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <h5 className="text-lg font-semibold mb-6">
        Sorry we have something wrong right now. Please try again later!
      </h5>
    )
  }

  if (user?.stats?.totalFollowings === 0) {
    return (
      <div className="max-w-xl mx-auto">
        <InitialSuggestUsers />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <NewsFeed />
    </div>
  )
}

export default NewsFeedPage
