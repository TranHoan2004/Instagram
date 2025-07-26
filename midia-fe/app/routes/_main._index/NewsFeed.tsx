import useInfiniteScroll from 'react-infinite-scroll-hook'
import { useDispatch, useSelector } from 'react-redux'
import PostCard from '~/components/post/PostCard'
import PostDetailModal from '~/components/post/PostDetailModal'
import Loading from '~/components/ui/Loading'
import { useNewsFeed } from '~/hooks/usePost'
import type { RootState } from '~/redux/store'
import { openModal, closeModal } from '~/redux/post-modal-slice'

const NewsFeed = () => {
  const { edges, pageInfo, loading, loadMore } = useNewsFeed({
    first: 12
  })
  const posts = edges.map((edge) => edge.node)
  const hasNextPage = pageInfo?.hasNextPage

  const [infiniteRef] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    rootMargin: '0px 0px 200px 0px'
  })
  const dispatch = useDispatch()
  const { isOpen, selectedIndex } = useSelector(
    (state: RootState) => state.postModal
  )

  const setSelectedPostIndex = (idx: number | null) => {
    if (idx !== null) {
      dispatch(openModal({ selectedIndex: idx }))
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <section>
        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            onOpenComments={() => setSelectedPostIndex(index)}
          />
        ))}
        {hasNextPage && (
          <div className="mb-3" ref={infiniteRef}>
            <Loading />
          </div>
        )}
      </section>
      {selectedIndex !== null && (
        <PostDetailModal
          isOpen={isOpen}
          onClose={() => dispatch(closeModal())}
          post={posts[selectedIndex]}
          posts={posts}
          selectedIndex={selectedIndex || 0}
          setSelectedIndex={setSelectedPostIndex}
        />
      )}
    </>
  )
}

export default NewsFeed
