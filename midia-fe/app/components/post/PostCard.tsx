import { useRef, useState, useEffect } from 'react'
import {
  BookmarkIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  HeartIcon as HeartOutline
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid'
import { Card, CardHeader, CardBody, CardFooter, Textarea } from '@heroui/react'
import EmojiPicker from '../ui/EmojiPicker'
import type { CommentType, Post } from '~/lib/graphql-types'
import PostImageCarousel from './PostImageCarousel'
import Avatar from '../ui/Avatar'
import { useCommentsByPostId, useCreateComment } from '~/hooks/useComment'
import useSuggestUsers from '~/hooks/useSuggestion'

const PostCard = ({
  post,
  onOpenComments
}: {
  post: Post
  onOpenComments: () => void
}) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [commentText, setCommentText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { comments, refetchComments } = useCommentsByPostId(post?.id)
  const { createComment } = useCreateComment()

  const { edges } = useSuggestUsers({
    first: 100,
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'no-cache'
  })
  const suggestionsUsers = edges.map((e) => e.node)
  const [isFollowing, setIsFollowing] = useState(
    !suggestionsUsers.find((u) => u.id === post.author?.id)
  )

  useEffect(() => {
    setIsFollowing(!suggestionsUsers.find((u) => u.id === post.author?.id))
  }, [suggestionsUsers, post.author?.id])

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const { selectionStart: start, selectionEnd: end } = textarea
      const updated =
        commentText.slice(0, start) + emoji + commentText.slice(end)
      setCommentText(updated)
      setTimeout(() => {
        textarea.focus()
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length
      }, 0)
    } else {
      setCommentText(commentText + emoji)
    }
  }

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !post.id) return
    try {
      await createComment({
        postId: post.id,
        content: commentText,
        parentId: null
      })
      await refetchComments()
      setCommentText('')
    } catch (error) {
      console.error('Error creating comment:', error)
    }
  }

  return (
    <Card
      className="mb-6 bg-transparent shadow-none border-b border-divider"
      radius="none"
    >
      <CardHeader className="p-4 flex items-center justify-between">
        <Avatar
          id={post.author?.id!!}
          avatar={post.author?.profile?.avatarUrl}
          username={post.author?.username || ''}
          subtitle={post.author?.profile?.fullName}
          isFollowing={isFollowing}
        />

        <EllipsisHorizontalIcon
          className="w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white cursor-pointer"
          onClick={() => console.log('more options')}
        />
      </CardHeader>

      <CardBody className="p-0">
        <PostImageCarousel
          image={post.attachments?.[0]?.originalLink}
          alt="Post content"
        />
      </CardBody>

      <CardFooter className="flex-col gap-4 p-4">
        <div className="flex justify-between w-full">
          <div className="flex gap-6">
            <span
              onClick={() => setIsLiked(!isLiked)}
              className="cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            >
              {isLiked ? (
                <HeartSolid className="w-7 h-7 text-red-500" />
              ) : (
                <HeartOutline className="w-7 h-7 hover:text-red-500" />
              )}
            </span>
            <span
              onClick={onOpenComments}
              className="cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            >
              <ChatBubbleLeftIcon className="w-7 h-7 hover:text-blue-500" />
            </span>
          </div>
          <span
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          >
            {isBookmarked ? (
              <BookmarkSolid className="w-7 h-7 text-yellow-500" />
            ) : (
              <BookmarkIcon className="w-7 h-7 hover:text-yellow-500" />
            )}
          </span>
        </div>

        <div className="w-full space-y-3">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {(post.totalLikes + (isLiked ? 1 : 0)).toLocaleString()} likes
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-200">
            <span className="font-bold cursor-pointer mr-1">
              {post.author?.username}
            </span>
            {post.caption}
          </p>

          <p
            onClick={onOpenComments}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
          >
            View all {comments?.length} comments
          </p>

          {comments.slice(0, 2).map((comment: CommentType) => (
            <p
              key={comment.id}
              className="text-sm text-gray-800 dark:text-gray-200"
            >
              <span className="font-bold cursor-pointer mr-1">
                {comment.author?.username}
              </span>
              {comment.content}
            </p>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <Textarea
              ref={textareaRef}
              placeholder="Add a comment…"
              variant="flat"
              size="sm"
              value={commentText}
              onValueChange={setCommentText}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleCommentSubmit()
                }
              }}
              minRows={1}
              maxRows={3}
              classNames={{
                input: 'text-sm',
                inputWrapper: '!bg-transparent !shadow-none px-0'
              }}
            />
            {commentText.trim() && (
              <span
                onClick={handleCommentSubmit}
                className="text-blue-500 text-sm font-medium cursor-pointer"
              >
                Post
              </span>
            )}
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default PostCard
