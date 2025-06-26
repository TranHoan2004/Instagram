import { useState, useRef } from 'react'
import { Button, Select, SelectItem } from '@heroui/react'
import UserTagModal from '~/components/layout/left-nav/UserTagModal'
import EmojiPicker from '~/components/ui/EmojiPicker'

interface ImageEditModalProps {
  files: File[]
  caption: string
  visibility: string
  taggedUsers: { username: string; x: number; y: number }[]
  isSubmitting: boolean
  onCaptionChange: (value: string) => void
  onVisibilityChange: (value: string) => void
  onTaggedUsersChange: (
    users: { username: string; x: number; y: number }[]
  ) => void
  onSubmit: () => void
}

const MAX_CHARS = 200
const ImageEditModal = ({
  files,
  caption,
  visibility,
  taggedUsers,
  isSubmitting,
  onCaptionChange,
  onVisibilityChange,
  onTaggedUsersChange,
  onSubmit
}: ImageEditModalProps) => {
  const [isTagging, setIsTagging] = useState(false)
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentFile = files[currentFileIndex]

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setClickPosition({ x, y })
    setIsTagging(true)
  }

  const handleCaptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value
    if (value.length <= MAX_CHARS) {
      onCaptionChange(value)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue =
        caption.slice(0, start) + emoji + caption.slice(end)
      if (newValue.length <= MAX_CHARS) {
        onCaptionChange(newValue)
        setTimeout(() => {
          textarea.focus()
          textarea.selectionStart = textarea.selectionEnd = start + emoji.length
        }, 0)
      }
    } else {
      if ((caption + emoji).length <= MAX_CHARS) {
        onCaptionChange(caption + emoji)
      }
    }
  }

  return (
    <div className="flex h-[600px]">
      {/* Image Preview */}
      <div className="w-2/3 relative">
        {currentFile && (
          <img
            src={URL.createObjectURL(currentFile)}
            alt="Preview"
            className="w-full h-full object-contain cursor-pointer"
            onClick={handleImageClick}
          />
        )}
        {taggedUsers.map((user, index) => (
          <div
            key={`${user.username}-${index}`}
            className="absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs"
            style={{ left: `${user.x}%`, top: `${user.y}%` }}
          >
            @
          </div>
        ))}
        
        {/* File navigation arrows */}
        {files.length > 1 && (
          <>
            <button
              onClick={() => setCurrentFileIndex(prev => Math.max(0, prev - 1))}
              disabled={currentFileIndex === 0}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-50"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentFileIndex(prev => Math.min(files.length - 1, prev + 1))}
              disabled={currentFileIndex === files.length - 1}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-50"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Edit Panel */}
      <div className="w-1/3 border-l border-gray-200 dark:border-neutral-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <img
              src="https://i.pravatar.cc/150?img=1"
              alt="User"
              className="w-8 h-8 rounded-full"
            />
            <span className="font-semibold">username</span>
          </div>
        </div>

        {/* File thumbnails */}
        {files.length > 1 && (
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex gap-2 overflow-x-auto">
              {files.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`File ${index + 1}`}
                  className={`w-16 h-16 object-cover rounded cursor-pointer ${
                    index === currentFileIndex ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setCurrentFileIndex(index)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 p-4">
          <textarea
            ref={textareaRef}
            value={caption}
            onChange={handleCaptionChange}
            maxLength={MAX_CHARS}
            placeholder="Write a caption..."
            className="w-full h-full resize-none outline-none bg-transparent"
          />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-neutral-700 relative">
          <div className="flex items-center justify-between">
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              iconClassName="hover:bg-gray-100 dark:hover:bg-neutral-700"
            />
            <span
              className={`text-sm ${caption.length === MAX_CHARS ? 'text-red-500' : 'text-gray-500'}`}
            >
              {caption.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
          <Select
            label="Visibility"
            selectedKeys={[visibility]}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string
              onVisibilityChange(selectedKey)
            }}
            className="mb-4"
          >
            <SelectItem key="PUBLIC">Public</SelectItem>
            <SelectItem key="PRIVATE">Private</SelectItem>
            <SelectItem key="FRIENDS_ONLY">Friends Only</SelectItem>
          </Select>
          
          <Button
            color="primary"
            className="w-full"
            onPress={onSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? 'Sharing...' : 'Share'}
          </Button>
        </div>  
      </div>

      {isTagging && (
        <UserTagModal
          onClose={() => setIsTagging(false)}
          onTagUser={(username) => {
            onTaggedUsersChange([
              ...taggedUsers,
              { ...clickPosition, username }
            ])
            setIsTagging(false)
          }}
        />
      )}
    </div>
  )
}

export default ImageEditModal 