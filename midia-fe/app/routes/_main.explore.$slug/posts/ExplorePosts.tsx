import useInfiniteScroll from 'react-infinite-scroll-hook'
import { useDispatch, useSelector } from 'react-redux'
import PostDetailModal from '~/components/post/PostDetailModal'
import Loading from '~/components/ui/Loading'
import { useNewsFeed } from '~/hooks/usePost'
import type { RootState } from '~/redux/store'
import { openModal, closeModal } from '~/redux/post-modal-slice'
import ProfileThumbnail from '~/components/profile/ProfileThumbnail'
import type { Post } from '~/lib/graphql-types'

const ExplorePosts = () => {
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

  const onPostClick = (post: Post) => {
    let globalIndex = -1
    for (let i = 0; i < posts.length; i++) {
      if (posts[i].id === post.id) {
        globalIndex = i
        break
      }
    }

    if (globalIndex !== -1) {
      dispatch(openModal({ selectedIndex: globalIndex }))
    } else {
      console.warn('Could not find global index for post:', post)
    }
  }

  if (loading && posts.length === 0) {
    return <Loading />
  }

  function chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  }
  const blocks = chunk(posts, 5)

  return (
    <>
      <div className="space-y-1 max-w-[1000px] mx-auto">
        {blocks.map((block, bIdx) => (
          <div
            key={bIdx}
            className="flex flex-col md:flex-row md:even:flex-row-reverse items-center gap-0.5 md:gap-1"
          >
            <div className="w-full md:w-2/3 grid grid-cols-2 grid-rows-2 gap-0.5 md:gap-1">
              {block.slice(0, 4).map((post, idx) => (
                <ProfileThumbnail
                  key={post.id}
                  src={post?.attachments?.[0]?.originalLink || ''}
                  alt={post.caption || ''}
                  likes={post?.totalLikes}
                  comments={post?.totalComments}
                  attachments={post.attachments}
                  onClick={() => onPostClick(post, idx)}
                  className="!pb-[70%] !rounded-none"
                />
              ))}
            </div>

            <div className="w-full md:w-1/3">
              {block[4] && (
                <ProfileThumbnail
                  key={block[4].id}
                  src={block[4]?.attachments?.[0]?.originalLink || ''}
                  alt={block[4].caption || ''}
                  likes={block[4]?.totalLikes}
                  comments={block[4]?.totalComments}
                  attachments={block[4].attachments}
                  onClick={() => onPostClick(block[4], 4)}
                  className="!pb-[140%] !rounded-none"
                />
              )}
            </div>
          </div>
        ))}
        {hasNextPage && (
          <div ref={infiniteRef} className="py-4">
            <Loading />
          </div>
        )}
        {!hasNextPage && !loading && posts.length > 0 && (
          <p className="text-center text-gray-500 py-4">
            You've reached the end!
          </p>
        )}
      </div>

      {isOpen && selectedIndex !== null && posts[selectedIndex] && (
        <PostDetailModal
          posts={posts}
          selectedIndex={selectedIndex}
          setSelectedIndex={(newIdx: number) => {
            dispatch(openModal({ selectedIndex: newIdx }))
          }}
          isOpen={isOpen}
          onClose={() => dispatch(closeModal())}
          post={posts[selectedIndex]}
        />
      )}
    </>
  )
}

export default ExplorePosts
