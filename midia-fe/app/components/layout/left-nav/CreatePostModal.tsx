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
  image: File | null
  description: string
  taggedUsers: TaggedUser[]
}

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const [step, setStep] = useState<'upload' | 'edit'>('upload')
  const [postData, setPostData] = useState<CreatePostData>({
    image: null,
    description: '',
    taggedUsers: []
  })

  const handleImageSelect = (file: File) => {
    setPostData((prev) => ({ ...prev, image: file }))
    setStep('edit')
  }

  const handleClose = () => {
    setStep('upload')
    setPostData({
      image: null,
      description: '',
      taggedUsers: []
    })
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
            <ImageUploadModal onImageSelect={handleImageSelect} />
          ) : (
            <ImageEditModal
              image={postData.image}
              description={postData.description}
              taggedUsers={postData.taggedUsers}
              onDescriptionChange={(value) =>
                setPostData((prev) => ({ ...prev, description: value }))
              }
              onTaggedUsersChange={(users) =>
                setPostData((prev) => ({ ...prev, taggedUsers: users }))
              }
              onSubmit={() => {
                console.log('Post data:', postData)
                handleClose()
              }}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default CreatePostModal
