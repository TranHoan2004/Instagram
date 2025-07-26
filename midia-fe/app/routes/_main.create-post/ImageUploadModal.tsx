import { PhotoIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useRef, useState, useEffect } from 'react'
import { getAttachmentUrls, uploadFile } from '~/services/attachment.service'

interface Attachment {
  id?: string
  file: File
  uploading: boolean
  onDemandLink?: string
}

interface ImageUploadModalProps {
  onFilesSelect: (attachments: Attachment[]) => void
}

const ImageUploadModal = ({ onFilesSelect }: ImageUploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])

  // Log attachments mỗi khi thay đổi
  useEffect(() => {
    console.log('[ImageUploadModal] attachments state:', attachments)
  }, [attachments])

  const handleUploadFile = async (file: File, index: number) => {
    console.log('[handleUploadFile] Start upload', {
      fileName: file.name,
      fileSize: file.size,
      index
    })
    try {
      const [response] = await uploadFile([file])
      console.log('[handleUploadFile] Upload success', {
        fileName: file.name,
        attachmentId: response.attachmentId
      })
      setAttachments((prev) =>
        prev.map((att, i) =>
          i === index
            ? { ...att, id: response.attachmentId, uploading: false }
            : att
        )
      )
    } catch (error) {
      console.error('[handleUploadFile] Upload failed:', {
        fileName: file.name,
        error
      })
      setAttachments((prev) =>
        prev.map((att, i) => (i === index ? { ...att, uploading: false } : att))
      )
    }
  }
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      // Lọc file đã có trong attachments (theo name+size)
      const existing = new Set(
        attachments.map((att) => att.file.name + att.file.size)
      )
      const newFiles = files.filter((f) => !existing.has(f.name + f.size))
      if (newFiles.length === 0) return
      // uploadFile luôn trả về UploadResult[]
      const results = await uploadFile(newFiles) // results: UploadResult[]
      // Lấy tất cả id vừa upload
      const ids = results.map((r) => r.attachmentId)
      // Gọi batch lấy on-demand link
      const urlMap = await getAttachmentUrls(ids)
      // Gộp vào attachments
      const newAttachments: Attachment[] = results.map((r) => ({
        file: r.file,
        id: r.attachmentId,
        uploading: false,
        onDemandLink: urlMap[r.attachmentId]
      }))
      setAttachments([...attachments, ...newAttachments])
    }
  }

  /**
   * Handle drag and drop events
   */
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files || [])
    console.log(
      '[handleDrop] Files dropped:',
      files.map((f) => ({ name: f.name, size: f.size }))
    )
    if (files.length > 0) {
      const newAttachments: Attachment[] = files.map((file) => ({
        file,
        uploading: true
      }))
      const startIdx = attachments.length
      setAttachments((prev) => [...prev, ...newAttachments])
      newAttachments.forEach((att, i) => {
        console.log('[handleDrop] Trigger uploadFile', {
          fileName: att.file.name,
          index: startIdx + i
        })
        handleUploadFile(att.file, startIdx + i)
      })
    }
  }

  /**
   * Handle Next button click - only send attachments that have been uploaded (have ID)
   */
  const handleNext = () => {
    const completedAttachments = attachments.filter(
      (att) => att.id
    ) as Attachment[]
    onFilesSelect(completedAttachments)
  }

  /**
   * Handle Add More button click
   */
  const handleAddMore = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center p-8 min-h-[400px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Next button */}
      {attachments.length > 0 && (
        <button
          className="absolute top-4 right-6 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors z-10"
          onClick={handleNext}
          type="button"
          disabled={attachments.some((att) => !att.id)}
        >
          Next
        </button>
      )}

      {/* Empty state - no images selected */}
      {attachments.length === 0 && (
        <div className="text-center">
          <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Upload photos and videos here
          </h3>
          <p className="text-gray-500 mb-4">
            You can select only one file
          </p>
          <button
            onClick={handleAddMore}
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
      )}

      {/* Image thumbnails and add button */}
      {attachments.length > 0 && (
        <div className="flex flex-col items-center w-full">
          <div className="flex gap-4 mb-6">
            {attachments.map((att, idx) => {
              const isVideo = att.file.type.startsWith('video/')
              const src = att.onDemandLink
                ? att.onDemandLink
                : URL.createObjectURL(att.file)
              return (
                <div
                  key={idx}
                  className="relative w-24 h-24 rounded overflow-hidden border border-gray-200 flex items-center justify-center"
                >
                  {isVideo ? (
                    <video
                      src={src}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={src}
                      alt={`Attachment ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {att.uploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
                      <span className="text-xs text-gray-500">
                        Uploading...
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
            {/* Add more button */}
            <button
              onClick={handleAddMore}
              className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded hover:bg-gray-100 transition-colors"
              type="button"
            >
              <PlusIcon className="w-10 h-10 text-gray-400" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}
    </div>
  )
}

export default ImageUploadModal
