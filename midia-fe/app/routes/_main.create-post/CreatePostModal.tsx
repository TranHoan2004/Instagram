import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react'
import ImageUploadModal from './ImageUploadModal'
import ImageEditModal from './ImageEditModal'

export type TaggedUser = {
  username: string
  x: number
  y: number
}

export type CreatePostData = {
  files: File[]
  caption: string
  visibility: string
  taggedUsers: TaggedUser[]
}

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const [step, setStep] = useState<'upload' | 'edit'>('upload')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postData, setPostData] = useState<CreatePostData>({
    files: [],
    caption: '',
    visibility: 'PUBLIC',
    taggedUsers: []
  })

  const handleFilesSelect = (files: File[]) => {
    setPostData((prev) => ({ ...prev, files }))
    setStep('edit')
  }

  const handleSubmit = async () => {
    if (postData.files.length === 0) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('caption', postData.caption)
      formData.append('visibility', postData.visibility)
      
      postData.files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch('http://localhost:8000/api/posts', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        console.log('Post created successfully')
        handleClose()
      } else {
        console.error('Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('upload')
    setPostData({
      files: [],
      caption: '',
      visibility: 'PUBLIC',
      taggedUsers: []
    })
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="4xl"
      classNames={{
        base: 'bg-white dark:bg-neutral-800',
        header: 'border-b border-gray-200 dark:border-neutral-700',
        body: 'p-0',
        footer: 'border-t border-gray-200 dark:border-neutral-700'
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between">
          Create new post
        </ModalHeader>
        <ModalBody>
          {step === 'upload' ? (
            <ImageUploadModal onFilesSelect={handleFilesSelect} />
          ) : (
            <ImageEditModal
              files={postData.files}
              caption={postData.caption}
              visibility={postData.visibility}
              taggedUsers={postData.taggedUsers}
              isSubmitting={isSubmitting}
              onCaptionChange={(value) =>
                setPostData((prev) => ({ ...prev, caption: value }))
              }
              onVisibilityChange={(value) =>
                setPostData((prev) => ({ ...prev, visibility: value }))
              }
              onTaggedUsersChange={(users) =>
                setPostData((prev) => ({ ...prev, taggedUsers: users }))
              }
              onSubmit={handleSubmit}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default CreatePostModal 