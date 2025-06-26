import React, { useState, useEffect, useRef } from 'react'
import {
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Modal } from '@heroui/react'
import { motion } from 'framer-motion'
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { Textarea } from '@heroui/react'
import EmojiPicker from '../ui/EmojiPicker'
import type { Post, Comment } from '~/lib/types'

interface PostDetailModalProps {
  isOpen: boolean
  onClose: () => void
  post: Post
  posts: Post[]
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
  const [show, setShow] = useState(isOpen)
  const [comment, setComment] = useState('')
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const [replyingTo, setReplyingTo] = useState<{
    id: string
    username: string
  } | null>(null)
  const [comments, setComments] = useState(
    post.comments.map((c) => ({ ...c, isLiked: c.isLiked || false }))
  )
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  const mediaList = Array.isArray(post.image) ? post.image : [post.image]

  const handlePrevMedia = () => setCurrentMediaIndex((i) => Math.max(i - 1, 0))
  const handleNextMedia = () =>
    setCurrentMediaIndex((i) => Math.min(i + 1, mediaList.length - 1))
  const touchStartX = useRef<number | null>(null)
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

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const { selectionStart: start, selectionEnd: end } = textarea
      const updated = comment.slice(0, start) + emoji + comment.slice(end)
      setComment(updated)
      setTimeout(() => {
        textarea.focus()
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length
      }, 0)
    } else {
      setComment(comment + emoji)
    }
  }

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        // setShowEmojiPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!show) return null

  const handleLike = () => {
    if (!liked) {
      setLiked(true)
      setLikeCount(likeCount + 1)
    } else {
      setLiked(false)
      setLikeCount(likeCount - 1)
    }
  }

  const handleLikeComment = (id: string | undefined) => {
    if (!id) return
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isLiked: !c.isLiked,
              likes: (c.likes || 0) + (c.isLiked ? -1 : 1)
            }
          : c
      )
    )
  }

  const handleReplyClick = (comment: { id?: string; username: string }) => {
    if (!comment.id) return
    setReplyingTo({ id: comment.id, username: comment.username })
    textareaRef.current?.focus()
  }

  const handleCommentSubmit = () => {
    if (!comment.trim()) return
    const newComment: Comment = {
      id: Date.now().toString(),
      username: 'You', // Giả sử tên người dùng hiện tại là 'You'
      content: replyingTo ? `@${replyingTo.username} ${comment}` : comment,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false
    }
    setComments([...comments, newComment])
    setComment('')
    setReplyingTo(null)
  }

  const renderComments = (commentList: Comment[]) => (
    <div className="flex flex-col gap-4">
      {commentList.map((c) => (
        <div key={c.id || Math.random()} className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold font-['Helvetica'] text-gray-900 dark:text-white cursor-pointer hover:underline">
                {c.username}
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                {c.content}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <button
                onClick={() => handleLikeComment(c.id)}
                className="hover:text-red-500 dark:hover:text-red-400 font-semibold flex items-center gap-1"
              >
                {c.isLiked ? (
                  <HeartSolid className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartOutline className="w-4 h-4" />
                )}
                {c.likes || 0}
              </button>
              <button
                onClick={() => handleReplyClick(c)}
                className="hover:text-gray-700 dark:hover:text-gray-300 font-semibold"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-0"
      backdrop="transparent"
    >
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 z-[90]"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      <div className="min-h-screen w-full text-center">
        {/* Navigation Buttons */}
        <div
          className={`fixed left-6 top-1/2 -translate-y-1/2 z-[110] transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}
        >
          <button
            className="bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white rounded-full p-1.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            className="bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white rounded-full p-1.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              setSelectedIndex(selectedIndex + 1)
            }}
            disabled={selectedIndex === posts.length - 1}
            aria-label="Bài kế tiếp"
          >
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Close Button */}
        <div
          className={`fixed top-4 right-4 z-[100] transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
        >
          <button
            className="bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white rounded-full p-1.5 transition-all duration-300 shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={onClose}
            aria-label="Đóng"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex justify-center items-center h-full min-h-screen">
          <div
            className={`w-full max-w-[80vw] h-[90vh] min-h-[400px] overflow-hidden text-left bg-white dark:bg-black shadow-xl rounded-lg z-[100] transform transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full min-h-[400px] flex-col md:flex-row">
              {/* Media Section */}
              <div
                className="relative w-full md:w-1/2 h-[300px] md:h-full bg-gray-50 dark:bg-black flex items-center justify-center overflow-hidden"
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
                  {mediaList.map((url, idx) => (
                    <div
                      key={idx}
                      className="w-full h-full flex-shrink-0 flex items-center justify-center"
                    >
                      {/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i.test(url) ? (
                        <video
                          src={url}
                          controls
                          className="w-full h-full object-cover bg-black"
                        />
                      ) : (
                        <img
                          src={url}
                          alt="media"
                          className="w-full h-full object-cover bg-black"
                          draggable={false}
                        />
                      )}
                    </div>
                  ))}
                </motion.div>
                {/* Prev/Next buttons */}
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
                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {mediaList.map((_, index) => (
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

              {/* Content Section */}
              <div className="w-full md:w-1/2 flex flex-col border-l border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
                  <img
                    src={post.user.avatar}
                    alt={post.user.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="font-semibold font-['Helvetica'] text-gray-900 dark:text-white">
                    {post.user.username}
                  </span>
                </div>

                {/* Comments Section */}
                <div
                  className="flex-1 overflow-y-auto p-4 border-b border-gray-200 dark:border-gray-800 space-y-4"
                  tabIndex={0}
                  role="region"
                  aria-label="Comments section"
                >
                  {renderComments(comments)}
                </div>

                {/* Actions and Comment Input */}
                <div className="p-4">
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300 mb-4 font-['Helvetica']">
                    <div className="flex items-center gap-2">
                      <span
                        onClick={handleLike}
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
                    <span>{post.timestamp}</span>
                  </div>

                  {/* Comment Input */}
                  <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-800 pt-4 relative">
                    <button
                      type="button"
                      className="p-1 hover:text-gray-600 dark:hover:text-gray-200 text-gray-600 dark:text-gray-300"
                      aria-label="Chọn emoji"
                    >
                      <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </button>
                    <Textarea
                      ref={textareaRef}
                      placeholder={
                        replyingTo
                          ? `Reply to @${replyingTo.username}...`
                          : 'Add a comment…'
                      }
                      variant="flat"
                      size="sm"
                      value={comment}
                      onValueChange={setComment}
                      minRows={1}
                      maxRows={3}
                      classNames={{
                        input: 'text-sm',
                        inputWrapper: '!bg-transparent !shadow-none px-0'
                      }}
                    />
                    {comment.trim() && (
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
      </div>
    </Modal>
  )
}

export default PostDetailModal
