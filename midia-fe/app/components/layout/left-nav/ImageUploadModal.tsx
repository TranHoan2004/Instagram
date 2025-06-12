import { PhotoIcon } from '@heroicons/react/24/outline'
import { useRef } from 'react'

interface ImageUploadModalProps {
  onImageSelect: (file: File) => void
}

const ImageUploadModal = ({ onImageSelect }: ImageUploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      onImageSelect(file)
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center p-8 min-h-[400px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          Drag photos and videos here
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          type="button"
        >
          Select from computer
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  )
}

export default ImageUploadModal
