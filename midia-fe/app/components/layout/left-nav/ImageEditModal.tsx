import { useState, useRef } from 'react'
import { Button } from '@heroui/react'
import UserTagModal from './UserTagModal'
import EmojiPicker from '~/components/ui/EmojiPicker'

interface ImageEditModalProps {
  image: File | null
  description: string
  taggedUsers: { username: string; x: number; y: number }[]
  onDescriptionChange: (value: string) => void
  onTaggedUsersChange: (
    users: { username: string; x: number; y: number }[]
  ) => void
  onSubmit: () => void
}

const MAX_CHARS = 200
const ImageEditModal = ({
  image,
  description,
  taggedUsers,
  onDescriptionChange,
  onTaggedUsersChange,
  onSubmit
}: ImageEditModalProps) => {
  const [isTagging, setIsTagging] = useState(false)
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setClickPosition({ x, y })
    setIsTagging(true)
  }

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value
    if (value.length <= MAX_CHARS) {
      onDescriptionChange(value)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue =
        description.slice(0, start) + emoji + description.slice(end)
      if (newValue.length <= MAX_CHARS) {
        onDescriptionChange(newValue)
        setTimeout(() => {
          textarea.focus()
          textarea.selectionStart = textarea.selectionEnd = start + emoji.length
        }, 0)
      }
    } else {
      if ((description + emoji).length <= MAX_CHARS) {
        onDescriptionChange(description + emoji)
      }
    }
  }

  return (
    <div className="flex h-[600px]">
      {/* Image Preview */}
      <div className="w-2/3 relative">
        <img
          src={image ? URL.createObjectURL(image) : ''}
          alt="Preview"
          className="w-full h-full object-contain cursor-pointer"
          onClick={handleImageClick}
        />
        {taggedUsers.map((user, index) => (
          <div
            key={`${user.username}-${index}`}
            className="absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs"
            style={{ left: `${user.x}%`, top: `${user.y}%` }}
          >
            @
          </div>
        ))}
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

        <div className="flex-1 p-4">
          <textarea
            ref={textareaRef}
            value={description}
            onChange={handleDescriptionChange}
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
              className={`text-sm ${description.length === MAX_CHARS ? 'text-red-500' : 'text-gray-500'}`}
            >
              {description.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
          <Button
            color="primary"
            className="w-full"
            onPress={onSubmit}
            type="button"
          >
            Share
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
