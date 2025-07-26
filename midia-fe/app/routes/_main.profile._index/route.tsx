import { useAuth } from '~/contexts/AuthContext'
import { type MetaFunction } from 'react-router'
import { usePostsByAuthorId } from '~/hooks/usePost'
import useInfiniteScroll from 'react-infinite-scroll-hook'
import ProfileGrid from '~/components/profile/ProfileGrid'
import type { Route } from '../_main.profile._index/+types/route'
import { requireAuth } from '~/.server/auth'
import type { Post } from '~/lib/graphql-types'
import PostDetailModal from '~/components/post/PostDetailModal'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '~/redux/store'
import {
  closeModal,
  openModal,
  setSelectedIndex
} from '~/redux/post-modal-slice'
import Loading from '~/components/ui/Loading'

export const meta: MetaFunction = () => {
  return [{ title: 'Midia' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireAuth(request)
}

export default function ProfileIndex() {
  const { user } = useAuth()
  const userId = user?.id || ''
  const { edges, pageInfo, isLoading, error, loadMore } = usePostsByAuthorId(
    userId,
    12
  )
  const { isOpen: isModalOpen, selectedIndex: selectedPostIndex } = useSelector(
    (state: RootState) => state.postModal
  )
  const dispatch = useDispatch()

  // Transform edges to posts directly, no need for local state
  const posts = edges.map((edge) => edge.node)
  const hasNextPage = pageInfo?.hasNextPage

  const [infiniteRef] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage,
    onLoadMore: loadMore,
    disabled: Boolean(error)
  })

  const handleCloseModal = () => {
    dispatch(closeModal())
  }

  const handlePostClick = (post: Post, idx: number) => {
    dispatch(openModal({ selectedIndex: idx }))
  }

  const setSelectedPostIndex = (idx: number) => {
    dispatch(setSelectedIndex({ selectedIndex: idx }))
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <ProfileGrid
        posts={posts}
        onPostClick={handlePostClick}
        message="No posts yet"
      />
      {hasNextPage && (
        <div>
          <Loading />
        </div>
      )}
      {selectedPostIndex !== null && (
        <PostDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          post={posts[selectedPostIndex]}
          posts={posts}
          selectedIndex={selectedPostIndex}
          setSelectedIndex={setSelectedPostIndex}
        />
      )}
    </>
  )
}
