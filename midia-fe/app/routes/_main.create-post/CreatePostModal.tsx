import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react'
import { useCreatePost } from '~/hooks/usePost'
import ImageUploadModal from './ImageUploadModal'
import ImageEditModal from './ImageEditModal'

export type TaggedUser = {
  username: string
  x: number
  y: number
}

export type Attachment = {
  id?: string
  file: File
  uploading?: boolean
  onDemandLink?: string
}

export type CreatePostData = {
  files: Attachment[]
  attachmentIds: string[]
  caption: string
  visibility: string
  // taggedUsers: TaggedUser[]
}

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const [step, setStep] = useState<'upload' | 'edit'>('upload')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postInput, setPostInput] = useState<CreatePostData>({
    files: [],
    attachmentIds: [],
    caption: '',
    visibility: 'PUBLIC'
  })

  const handleFilesSelect = (attachments: Attachment[]) => {
    setPostInput((prev) => ({
      ...prev,
      files: attachments,
      attachmentIds: attachments.map((a) => a.id!).filter(Boolean)
    }))
    setStep('edit')
  }

  const {
    createPost,
  } = useCreatePost()

  const handleSubmit = async () => {
    if (postInput.attachmentIds.length === 0) return

    setIsSubmitting(true)
    try {
      await createPost({
        caption: postInput.caption,
        visibility: postInput.visibility,
        attachmentIds: postInput.attachmentIds
        // taggedUsers: postData.taggedUsers
      })

      handleClose()
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('upload')
    setPostInput({
      files: [],
      attachmentIds: [],
      caption: '',
      visibility: 'PUBLIC'
      // taggedUsers: []
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
              files={postInput.files}
              caption={postInput.caption}
              visibility={postInput.visibility}
              // taggedUsers={postData.taggedUsers}
              isSubmitting={isSubmitting}
              onCaptionChange={(value) =>
                setPostInput((prev) => ({ ...prev, caption: value }))
              }
              onVisibilityChange={(value) =>
                setPostInput((prev) => ({ ...prev, visibility: value }))
              }
              // onTaggedUsersChange={(users) =>
              //   setPostData((prev) => ({ ...prev, taggedUsers: users }))
              // }
              onSubmit={handleSubmit}
              attachmentIds={postInput.attachmentIds}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default CreatePostModal
