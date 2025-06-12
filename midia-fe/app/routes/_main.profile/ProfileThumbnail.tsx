interface ProfileThumbnailProps {
  src: string
  alt: string
}

const ProfileThumbnail = ({ src, alt }: ProfileThumbnailProps) => {
  return (
    <div className="relative w-full h-0 pb-[100%] overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
    </div>
  )
}

export default ProfileThumbnail
