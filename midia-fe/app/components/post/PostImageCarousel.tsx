import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Image } from '@heroui/react'

interface PostImageCarouselProps {
  image: string | string[] | undefined
  alt?: string
  className?: string
  onImageChange?: (index: number) => void
}

const PostImageCarousel = ({
  image,
  alt = 'Post content',
  className = '',
  onImageChange
}: PostImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const isMultiple = Array.isArray(image)
  const images = isMultiple ? image : [image]

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    onImageChange?.(newIndex)
  }

  const handleNext = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
    onImageChange?.(newIndex)
  }

  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index)
    onImageChange?.(index)
  }

  if (!images.length) return null

  return (
    <div
      className={`w-full max-h-[600px] overflow-hidden rounded ${className}`}
    >
      <div className="relative w-full h-full">
        <Image
          src={images[currentIndex]}
          alt={alt}
          radius="none"
          className="w-full h-full object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center z-10 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-5 h-5 text-white stroke-2" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center z-10 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-5 h-5 text-white stroke-2" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, index) => (
                <button
                  key={`indicator-${index}`}
                  onClick={() => handleIndicatorClick(index)}
                  className={`w-2 h-2 rounded-full transition-opacity ${
                    index === currentIndex
                      ? 'bg-white opacity-100'
                      : 'bg-white opacity-50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                  type="button"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PostImageCarousel
