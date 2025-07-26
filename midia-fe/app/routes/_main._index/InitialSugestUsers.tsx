import useInfiniteScroll from 'react-infinite-scroll-hook'
import UserListItem from '~/components/suggestion/UserListItem'
import Loading from '~/components/ui/Loading'
import useSuggestUsers from '~/hooks/useSuggestion'

const InitialSuggestUsers = () => {
  const { edges, loading, error, loadMore, pageInfo } = useSuggestUsers({
    first: 12
  })

  const users = edges.map((edge) => edge.node)
  const hasNextPage = pageInfo?.hasNextPage

  const [infiniteRef] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    disabled: Boolean(error),
    rootMargin: '0px 0px 200px 0px'
  })

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <h5 className="text-lg font-semibold mb-6">
        Sorry we have something wrong right now. Please try again later!
      </h5>
    )
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Suggested for you</h3>
      <section className="flex flex-col gap-4 overflow-y-auto mb-4">
        {users.map((user) => (
          <UserListItem
            key={user.id}
            id={user.id}
            username={user.username}
            avatar={user.profile?.avatarUrl}
            subtitle={user.profile?.fullName || ''}
          />
        ))}
      </section>

      {hasNextPage && (
        <div ref={infiniteRef}>
          <Loading />
        </div>
      )}
    </div>
  )
}

export default InitialSuggestUsers
