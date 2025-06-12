import { FilmIcon } from '@heroicons/react/24/outline'

export default function Reels() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <FilmIcon className="w-16 h-16 mb-4" />
        <p className="text-xl font-semibold">No Reels Yet</p>
      </div>
    </div>
  )
}
