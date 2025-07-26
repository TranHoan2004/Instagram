import { useParams, type MetaFunction } from 'react-router'
import type { Route } from '../_main.users.$userId._index/+types/route'
import { requireAuth } from '~/.server/auth'
import { usePostsByAuthorId } from '~/hooks/usePost'
import useInfiniteScroll from 'react-infinite-scroll-hook'
import ProfileGrid from '~/components/profile/ProfileGrid'
import { useDispatch, useSelector } from 'react-redux'
import {
  closeModal,
  openModal,
  setSelectedIndex
} from '~/redux/post-modal-slice'
import type { Post } from '~/lib/graphql-types'
import PostDetailModal from '~/components/post/PostDetailModal'
import type { RootState } from '~/redux/store'
import Loading from '~/components/ui/Loading'

export const meta: MetaFunction = () => {
  return [{ title: 'Midia' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireAuth(request)
}

const UserPosts = () => {
  const { userId } = useParams()
  const { edges, isLoading, error, loadMore, pageInfo } = usePostsByAuthorId(
    userId!!,
    12
  )
  const { isOpen: isModalOpen, selectedIndex: selectedPostIndex } = useSelector(
    (state: RootState) => state.postModal
  )
  const dispatch = useDispatch()

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

  if (isLoading) return <Loading />

  return (
    <>
      <ProfileGrid
        posts={posts}
        message="No posts yet"
        onPostClick={handlePostClick}
      />
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

export default UserPosts
