import React, { useState, useEffect, useRef } from 'react'
import {
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import {
  Avatar,
  Modal,
  Textarea,
  Button,
  useDisclosure,
  ModalContent,
  Image
} from '@heroui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import EmojiPicker from '../ui/EmojiPicker'
import type {
  Post as PostType,
  Attachment,
  CommentType
} from '~/lib/graphql-types'

import {
  useCreateComment,
  useLikeComment,
  useUnlikeComment,
  useCommentsByPostId
} from '~/hooks/useComment'
function formatDate(dateString: string) {
  const d = new Date(dateString)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

interface PostDetailModalProps {
  isOpen: boolean
  onClose: () => void
  post: PostType
  posts: PostType[]
  selectedIndex: number
  setSelectedIndex: (idx: number) => void
  thumbnailRect?: DOMRect
}

const PostDetailModal = ({
  isOpen,
  onClose,
  post,
  posts,
  selectedIndex,
  setSelectedIndex,
  thumbnailRect
}: PostDetailModalProps) => {
  const { onOpenChange, onClose: onModalClose } = useDisclosure({
    isOpen,
    onClose
  })
  const [show, setShow] = useState(isOpen)
  const [commentContent, setCommentContent] = useState('')
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post?.totalLikes || 0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [showOptions, setShowOptions] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{
    id: string
    username: string
  } | null>(null)

  const [localCommentLikes, setLocalCommentLikes] = useState<{
    [key: string]: boolean
  }>({})

  useEffect(() => {
    if (comments) {
      const initialLikes: { [key: string]: boolean } = {}
      comments.forEach((comment: CommentType) => {
        initialLikes[comment.id] = false
      })
      setLocalCommentLikes(initialLikes)
    }
  }, [])

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const touchStartX = useRef<number | null>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { createComment } = useCreateComment()
  const { likeComment } = useLikeComment()
  const { unlikeComment } = useUnlikeComment()

  const {
    comments,
    isLoading: commentsLoading,
    error: commentsError,
    refetchComments
  } = useCommentsByPostId(post?.id)

  // Media handling
  const mediaList: string[] = Array.isArray(post?.attachments)
    ? post.attachments.flatMap((att: Attachment) => {
        if (
          att.optimizedLinks &&
          Object.values(att.optimizedLinks).length > 0
        ) {
          return Object.values(att.optimizedLinks) as string[]
        }
        return att.originalLink ? [att.originalLink] : []
      })
    : []

  // Media navigation
  const handlePrevMedia = () => setCurrentMediaIndex((i) => Math.max(i - 1, 0))
  const handleNextMedia = () =>
    setCurrentMediaIndex((i) => Math.min(i + 1, mediaList.length - 1))

  // Touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (deltaX > 50 && currentMediaIndex > 0) handlePrevMedia()
    if (deltaX < -50 && currentMediaIndex < mediaList.length - 1)
      handleNextMedia()
    touchStartX.current = null
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setShow(true)
      if (thumbnailRect && imageRef.current) {
        const image = imageRef.current
        const modalRect = image.parentElement?.getBoundingClientRect()
        if (modalRect) {
          const scale = thumbnailRect.width / modalRect.width
          const translateX = thumbnailRect.left - modalRect.left
          const translateY = thumbnailRect.top - modalRect.top

          image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
          image.style.transition = 'none'

          void image.offsetHeight

          image.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          image.style.transform = 'translate(0, 0) scale(1)'
        }
      }
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 10)
    } else {
      setShow(false)
    }
  }, [isOpen, thumbnailRect])

  // Post actions
  const handlePostLike = () => {
    setLiked(!liked)
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))
  }

  // Comment actions
  const handleLikeComment = async (commentId: string) => {
    if (!commentId) return

    const comment = comments?.find((c: any) => c.id === commentId)
    if (!comment) return

    try {
      if (comment.isLiked) {
        await unlikeComment(commentId)
      } else {
        await likeComment(commentId)
        setLocalCommentLikes((prevLikes) => ({
          ...prevLikes,
          [commentId]: !prevLikes[commentId]
        }))
      }
      refetchComments()
    } catch (error) {
      console.error('Error liking/unliking comment:', error)
    }
  }

  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || !post.id) return

    const input = {
      postId: post.id,
      content: replyingTo
        ? `@${replyingTo.username} ${commentContent}`
        : commentContent,
      parentId: replyingTo?.id || null
    }

    try {
      await createComment(input)
      await refetchComments()
      setCommentContent('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Error creating comment:', error)
    }
  }

  const handleReplyClick = (comment: CommentType) => {
    setReplyingTo({ id: comment.id, username: comment.author.username })
    textareaRef.current?.focus()
  }

  // Emoji handling
  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const { selectionStart: start, selectionEnd: end } = textarea
      const updated =
        commentContent.slice(0, start) + emoji + commentContent.slice(end)
      setCommentContent(updated)
      setTimeout(() => {
        textarea.focus()
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length
      }, 0)
    } else {
      setCommentContent(commentContent + emoji)
    }
  }

  // Effects
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowLeft':
          if (selectedIndex > 0) {
            e.preventDefault()
            setSelectedIndex(selectedIndex - 1)
          }
          break
        case 'ArrowRight':
          if (selectedIndex < posts.length - 1) {
            e.preventDefault()
            setSelectedIndex(selectedIndex + 1)
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, posts.length, setSelectedIndex, onClose])

  // Click outside handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        // setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (!showOptions) return
    const handleClick = (e: MouseEvent) => {
      const popup = document.getElementById('post-option-popup')
      const btn = document.getElementById('post-option-btn')
      if (popup && popup.contains(e.target as Node)) return
      if (btn && btn.contains(e.target as Node)) return
      setShowOptions(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showOptions])

  if (!show) return null

  // Render comments
  const renderComments = () => {
    if (commentsLoading) {
      return <p className="text-center text-gray-500">Loading comments...</p>
    }

    if (commentsError) {
      return <p className="text-center text-red-500">Error loading comments</p>
    }

    return (
      <div className="flex flex-col gap-4">
        <div key={post?.id || Math.random()} className="flex items-start gap-3">
          <Avatar
            src={post?.author?.profile?.avatarUrl}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-left text-sm text-gray-900 dark:text-gray-100 break-words">
              <span className="font-semibold cursor-pointer hover:underline">
                {post?.author?.username}
              </span>
              <span className="ml-2">{post?.caption}</span>
            </p>
          </div>
        </div>

        {!comments || comments.length === 0 ? (
          <p className="text-center text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment: CommentType) => (
            <div key={comment.id} className="flex items-start gap-3">
              <Avatar
                src={comment.author?.profile?.avatarUrl || ''}
                alt={comment.author?.username}
                className="h-8 w-8 rounded-full overflow-hidden"
              />
              <div className="flex-1">
                <p className="text-left text-sm text-gray-900 dark:text-white break-words">
                  <span className="font-semibold cursor-pointer hover:underline">
                    {comment.author?.username}
                  </span>
                  <span className="ml-2 me-2">{comment.content}</span>
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>{formatDate(comment.createdAt)}</span>
                    <button
                      className="hover:underline"
                      onClick={() => handleReplyClick(comment)}
                    >
                      Reply
                    </button>
                    <span>{comment.totalLikes || 0} Likes</span>
                  </div>
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className="flex items-center hover:scale-110 transition-transform"
                  >
                    {localCommentLikes[comment.id] ? (
                      <HeartSolid className="w-4 h-4 text-red-500" />
                    ) : (
                      <HeartOutline className="w-4 h-4 hover:text-red-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  // const handleOption = (action: 'update' | 'delete') => {
  //   setShowOptions(false)
  //   if (action === 'update') {
  //   } else if (action === 'delete') {
  //   }
  // }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onModalClose}
      placement="center"
      scrollBehavior="normal"
      size="5xl"
      hideCloseButton
      radius="sm"
    >
      <ModalContent className="bg-white dark:bg-neutral-950 overflow-hidden">
        {(onClose) => (
          <>
            <div className="w-full h-full text-center max-h-[90vh] min-h-[400px] overflow-y-auto">
              <div
                className={`fixed left-6 top-1/2 -translate-y-1/2 z-[110] transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}
              >
                <button
                  className="bg-white dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-white rounded-full p-1.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => {
                    setSelectedIndex(selectedIndex - 1)
                  }}
                  disabled={selectedIndex === 0}
                  aria-label="Bài trước"
                >
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div
                className={`fixed right-6 top-1/2 -translate-y-1/2 z-[110] transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'}`}
              >
                <button
                  className="bg-white dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-white rounded-full p-1.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => {
                    setSelectedIndex(selectedIndex + 1)
                  }}
                  disabled={selectedIndex === posts.length - 1}
                  aria-label="Bài kế tiếp"
                >
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div
                className={`fixed top-4 right-4 z-[100] transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
              >
                <button
                  className="bg-white dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-white rounded-full p-1.5 transition-all duration-300 shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={onClose}
                  aria-label="Đóng"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex justify-center items-center h-full w-full">
                <div className="flex h-full flex-col md:flex-row">
                  <div
                    className="relative w-full h-full md:h-full bg-gray-50 dark:bg-black flex items-center justify-center overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    <motion.div
                      className="flex w-full h-full"
                      style={{
                        transform: `translateX(-${currentMediaIndex * 100}%)`,
                        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)'
                      }}
                    >
                      {mediaList.map((url: string) => (
                        <div
                          key={url}
                          className="relative w-full h-full flex-shrink-0 flex items-center justify-center"
                        >
                          {/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i.test(
                            url
                          ) ? (
                            <video
                              src={url}
                              controls
                              className="w-full h-full object-cover bg-black"
                            />
                          ) : (
                            <Image
                              src={url}
                              alt="media"
                              className="w-full h-full object-cover select-none"
                              loading="lazy"
                              radius="none"
                              height={800}
                              draggable={false}
                            />
                          )}
                        </div>
                      ))}
                    </motion.div>
                    <button
                      onClick={handlePrevMedia}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full w-9 h-9 flex items-center justify-center shadow-lg opacity-80 hover:opacity-100 transition-all duration-200 z-20 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Ảnh trước"
                      disabled={currentMediaIndex === 0}
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNextMedia}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full w-9 h-9 flex items-center justify-center shadow-lg opacity-80 hover:opacity-100 transition-all duration-200 z-20 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Ảnh tiếp theo"
                      disabled={currentMediaIndex === mediaList.length - 1}
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                      {mediaList.map((_, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentMediaIndex(index)}
                          className={`w-2 h-2 rounded-full border-none transition-all duration-200 focus:outline-none ${
                            index === currentMediaIndex
                              ? 'bg-white shadow-[0_0_2px_rgba(0,0,0,0.15)]'
                              : 'bg-gray-300'
                          }`}
                          aria-label={`Chuyển đến ảnh ${index + 1}`}
                          style={{ outline: 'none' }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 flex flex-col border-l border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800 justify-between relative">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={post?.author?.profile?.avatarUrl}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span className="font-semibold font-['Helvetica'] text-gray-900 dark:text-white">
                          {post?.author?.username}
                        </span>
                      </div>
                      <button
                        id="post-option-btn"
                        className="bg-white text-black dark:bg-black dark:text-white p-1.5 rounded-full cursor-pointer"
                        onClick={() => setShowOptions((v) => !v)}
                        aria-label="Tùy chọn bài viết"
                      >
                        <EllipsisHorizontalIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                      <AnimatePresence>
                        {showOptions && (
                          <motion.div
                            id="post-option-popup"
                            className="absolute right-0 top-12 z-[300] bg-white text-white dark:bg-black p-4 min-w-[220px] flex flex-col gap-2"
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{
                              duration: 0.18,
                              ease: [0.4, 0, 0.2, 1]
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-white-100 text-blue-400 font-semibold"
                              onPress={() => {
                                setShowOptions(false)
                                // handleOption('update')
                              }}
                              variant="light"
                            >
                              Update
                            </Button>
                            <Button
                              className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-white-800 text-red-400 font-semibold"
                              onPress={() => {
                                setShowOptions(false)
                                // handleOption('delete')
                              }}
                              variant="light"
                            >
                              Delete
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 border-b border-gray-200 dark:border-gray-800">
                      {renderComments()}
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300 mb-4 font-['Helvetica']">
                        <div className="flex items-center gap-2">
                          <span
                            onClick={handlePostLike}
                            className="cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                          >
                            {liked ? (
                              <HeartSolid className="w-7 h-7 text-red-500" />
                            ) : (
                              <HeartOutline className="w-7 h-7 hover:text-red-500" />
                            )}
                          </span>
                          <span>{likeCount} likes</span>
                        </div>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-800 pt-4 relative">
                        <EmojiPicker onEmojiSelect={handleEmojiSelect} />

                        <Textarea
                          ref={textareaRef}
                          placeholder={
                            replyingTo
                              ? `Reply to @${replyingTo.username}...`
                              : 'Add a comment…'
                          }
                          variant="flat"
                          size="sm"
                          value={commentContent}
                          onValueChange={setCommentContent}
                          minRows={1}
                          maxRows={3}
                          classNames={{
                            input: 'text-sm',
                            inputWrapper: '!bg-transparent !shadow-none px-0'
                          }}
                        />
                        {commentContent.trim() && (
                          <button
                            onClick={handleCommentSubmit}
                            className="text-blue-500 text-sm font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
                          >
                            Post
                          </button>
                        )}
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default PostDetailModal
