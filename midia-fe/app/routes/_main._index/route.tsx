import { useState } from 'react'
import type { LoaderFunction } from 'react-router'
import { requireAuth } from '~/.server/auth'
import PostCard from '~/components/post/PostCard'
import PostDetailModal from '~/components/post/PostDetailModal'
import type { Post } from '~/lib/types'

export const loader: LoaderFunction = async ({ request }) => {
  await requireAuth(request)
}

const NewsFeedPage = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const posts: Post[] = [
    {
      id: '1',
      user: {
        username: 'lewishamilton',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        isVerified: true,
        subtitle: 'Suggestion for you',
        isFollowing: false
      },
      timestamp: '1d',
      image: [
        'https://images.unsplash.com/photo-1749225667069-f7d8f585fa26?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop'
      ],
      likes: 741368,
      caption: 'Parabéns Ayrton, minha inspiração sempre 🏁',
      comments: []
    },
    {
      id: '2',
      user: {
        username: 'kurz_gesagt',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face',
        isVerified: true,
        isFollowing: true
      },
      timestamp: '3d',
      image:
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=600&fit=crop',
      likes: 89234,
      caption: 'String Theory explained in simple terms 🧵⚛️',
      comments: []
    },
    {
      id: '3',
      user: {
        username: 'natgeo',
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b332c813?w=32&h=32&fit=crop&crop=face',
        isVerified: true
      },
      timestamp: '8h',
      image:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
      likes: 156789,
      caption: 'The beauty of untouched wilderness 🏔️',
      comments: []
    },
    {
      id: '4',
      user: {
        username: 'spacex',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        isVerified: true
      },
      timestamp: '2h',
      image:
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&h=600&fit=crop',
      likes: 234567,
      caption: 'Another successful launch! 🚀',
      comments: []
    }
  ]

  return (
    <div className="max-w-xl mx-auto">
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          onOpenComments={() => setSelectedIndex(index)}
        />
      ))}
      {selectedIndex !== null && (
        <PostDetailModal
          isOpen={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          post={posts[selectedIndex]}
          posts={posts}
          selectedIndex={selectedIndex || 0}
          setSelectedIndex={setSelectedIndex}
        />
      )}
    </div>
  )
}

export default NewsFeedPage
