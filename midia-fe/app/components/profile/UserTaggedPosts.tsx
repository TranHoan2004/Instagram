import { TagIcon } from '@heroicons/react/24/outline'

export default function UserTaggedPosts() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <TagIcon className="w-16 h-16 mb-4" />
        <p className="text-xl font-semibold">No Tagged Posts Yet</p>
      </div>
    </div>
  )
}
