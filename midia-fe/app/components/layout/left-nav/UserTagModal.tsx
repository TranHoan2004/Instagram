import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

// Mock data cho danh sách user
const mockUsers = [
  { id: 1, username: 'john_doe' },
  { id: 2, username: 'jane_smith' },
  { id: 3, username: 'bob_wilson' },
  { id: 4, username: 'alice_johnson' },
  { id: 5, username: 'charlie_brown' }
]

interface UserTagModalProps {
  onClose: () => void
  onTagUser: (username: string) => void
}

const UserTagModal = ({ onClose, onTagUser }: UserTagModalProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = mockUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (filteredUsers.length > 0) {
      onTagUser(filteredUsers[0].username)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 w-96">
        <h3 className="text-lg font-semibold mb-4">Tag People</h3>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user to tag"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        <div className="max-h-60 overflow-y-auto">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => onTagUser(user.username)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg"
              type="button"
            >
              @{user.username}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg"
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserTagModal
