import type { Post } from '~/lib/types'
import ProfileThumbnail from '../_main.profile/ProfileThumbnail'

const mockPosts: Post[] = [
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user1", isVerified: false },
    id: "post1",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1742730710069-047fd04afb28?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0fHx8ZW58MHx8fHx8",
    likes: 100,
    caption: "Photo 1",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user2", isVerified: false },
    id: "post2",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1743657166982-9e3ff272122b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2fHx8ZW58MHx8fHx8",
    likes: 200,
    caption: "Photo 2",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user3", isVerified: false },
    id: "post3",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1745649547988-5d88a8a1faea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMnx8fGVufDB8fHx8fA%3D%3D",
    likes: 150,
    caption: "Photo 3",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user4", isVerified: false },
    id: "post4",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1749741340022-434e924e8312?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMXx8fGVufDB8fHx8fA%3D%3D",
    likes: 300,
    caption: "Photo 4",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user5", isVerified: false },
    id: "post5",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1747907471701-ff361d468f11?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNHx8fGVufDB8fHx8fA%3D%3D",
    likes: 250,
    caption: "Photo 5",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user6", isVerified: false },
    id: "post6",
    timestamp: "2023-10-01",
    image: "https://plus.unsplash.com/premium_photo-1675195120946-1ee171ab745a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyOHx8fGVufDB8fHx8fA%3D%3D",
    likes: 180,
    caption: "Photo 6",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user7", isVerified: false },
    id: "post7",
    timestamp: "2023-10-01",
    image: "https://plus.unsplash.com/premium_photo-1749747566151-9000fbe7281b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzM3x8fGVufDB8fHx8fA%3D%3D",
    likes: 220,
    caption: "Photo 7",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user8", isVerified: false },
    id: "post8",
    timestamp: "2023-10-01",
    image: "https://plus.unsplash.com/premium_photo-1749747566115-ad1db55754ee?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0Mnx8fGVufDB8fHx8fA%3D%3D",
    likes: 190,
    caption: "Photo 8",
    comments: [],
  },
  {
    user: { avatar: "https://images.unsplash.com/photo-1749223928612-e7f5e9a2211f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw5MHx8fGVufDB8fHx8fA%3D%3D", username: "user9", isVerified: false },
    id: "post9",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1749223928612-e7f5e9a2211f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw5MHx8fGVufDB8fHx8fA%3D%3D",
    likes: 210,
    caption: "Photo 9",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user10", isVerified: false },
    id: "post10",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1750112938913-a174d739469c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMDF8fHxlbnwwfHx8fHw%3D",
    likes: 230,
    caption: "Photo 10",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user1", isVerified: false },
    id: "post1",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1742730710069-047fd04afb28?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0fHx8ZW58MHx8fHx8",
    likes: 100,
    caption: "Photo 1",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user2", isVerified: false },
    id: "post2",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1743657166982-9e3ff272122b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2fHx8ZW58MHx8fHx8",
    likes: 200,
    caption: "Photo 2",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user3", isVerified: false },
    id: "post3",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1745649547988-5d88a8a1faea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMnx8fGVufDB8fHx8fA%3D%3D",
    likes: 150,
    caption: "Photo 3",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user4", isVerified: false },
    id: "post4",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1749741340022-434e924e8312?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMXx8fGVufDB8fHx8fA%3D%3D",
    likes: 300,
    caption: "Photo 4",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user5", isVerified: false },
    id: "post5",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1747907471701-ff361d468f11?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNHx8fGVufDB8fHx8fA%3D%3D",
    likes: 250,
    caption: "Photo 5",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user6", isVerified: false },
    id: "post6",
    timestamp: "2023-10-01",
    image: "https://plus.unsplash.com/premium_photo-1675195120946-1ee171ab745a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyOHx8fGVufDB8fHx8fA%3D%3D",
    likes: 180,
    caption: "Photo 6",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user7", isVerified: false },
    id: "post7",
    timestamp: "2023-10-01",
    image: "https://plus.unsplash.com/premium_photo-1749747566151-9000fbe7281b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzM3x8fGVufDB8fHx8fA%3D%3D",
    likes: 220,
    caption: "Photo 7",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user8", isVerified: false },
    id: "post8",
    timestamp: "2023-10-01",
    image: "https://plus.unsplash.com/premium_photo-1749747566115-ad1db55754ee?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0Mnx8fGVufDB8fHx8fA%3D%3D",
    likes: 190,
    caption: "Photo 8",
    comments: [],
  },
  {
    user: { avatar: "https://images.unsplash.com/photo-1749223928612-e7f5e9a2211f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw5MHx8fGVufDB8fHx8fA%3D%3D", username: "user9", isVerified: false },
    id: "post9",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1749223928612-e7f5e9a2211f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw5MHx8fGVufDB8fHx8fA%3D%3D",
    likes: 210,
    caption: "Photo 9",
    comments: [],
  },
  {
    user: { avatar: "https://via.placeholder.com/50", username: "user10", isVerified: false },
    id: "post10",
    timestamp: "2023-10-01",
    image: "https://images.unsplash.com/photo-1750112938913-a174d739469c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMDF8fHxlbnwwfHx8fHw%3D",
    likes: 230,
    caption: "Photo 10",
    comments: [],
  },
  
]

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

const Explore = () => {
  const blocks = chunk(mockPosts, 5)

  const handleClick = (post: Post, idx: number) => {
    console.log('Clicked post', idx, post)
  }

  return (
    <div className="space-y-1  max-w-[1000px] mx-auto">
      {blocks.map((block, bIdx) => (
        <div
          key={bIdx}
          className="flex flex-col md:flex-row md:even:flex-row-reverse items-center gap-0.5 md:gap-1"
        >
          {/* 2x2 image */}
          <div className="w-full md:w-2/3 grid grid-cols-2 grid-rows-2 gap-0.5 md:gap-1">
            {block.slice(0, 4).map((post, idx) => (
              <ProfileThumbnail
                key={post.id}
                src={
                  Array.isArray(post.image) ? post.image[0] : post.image
                }
                alt={post.caption}
                likes={post.likes}
                comments={post.comments.length}
                onClick={() => handleClick(post, idx)}
                className="!pb-[70%] !rounded-none"
              />
            ))}
          </div>

          {/* Single large image */}
          <div className="w-full md:w-1/3">
            {block[4] && (
              <ProfileThumbnail
                src={
                  Array.isArray(block[4].image)
                    ? block[4].image[0]
                    : block[4].image
                }
                alt={block[4].caption}
                likes={block[4].likes}
                comments={block[4].comments.length}
                onClick={() => handleClick(block[4], 4)}
                className="!pb-[140%] !rounded-none"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Explore
