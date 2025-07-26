import useInfiniteScroll from 'react-infinite-scroll-hook'
import UserListItem from '~/components/suggestion/UserListItem'
import Loading from '~/components/ui/Loading'
import useSuggestUsers from '~/hooks/useSuggestion'

const ExplorePeople = () => {
  const { edges, loading, error, loadMore, pageInfo } = useSuggestUsers({
    first: 20
  })

  const users = edges.map((edge) => edge.node)
  const hasNextPage = pageInfo?.hasNextPage

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    disabled: Boolean(error)
  })

  if (loading) {
    return (
      <div className="flex justify-center h-full w-full">
        <Loading />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <section className="flex flex-col gap-4" ref={rootRef}>
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

export default ExplorePeople
