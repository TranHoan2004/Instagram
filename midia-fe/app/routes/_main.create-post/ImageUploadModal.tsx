import { PhotoIcon } from '@heroicons/react/24/outline'
import { useRef } from 'react'
interface ImageUploadModalProps {
  onFilesSelect: (files: File[]) => void
}

const ImageUploadModal = ({ onFilesSelect }: ImageUploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      onFilesSelect(files)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files || [])
    if (files.length > 0) {
      onFilesSelect(files)
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
        <p className="text-gray-500 mb-4">
          You can select multiple files at once
        </p>
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
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  )
}

export default ImageUploadModal 