import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Input } from '@heroui/react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { gql, useLazyQuery } from '@apollo/client/index.js'
import type { User } from '~/lib/graphql-types'

const SEARCH_USERS = gql`
  query SearchUsers($param: String!) {
    searchUser(params: $param) {
      id
      username
    }
  }
`

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [loadUsers, { loading, error }] = useLazyQuery(
    SEARCH_USERS,
    {
      fetchPolicy: 'network-only',
      onCompleted: (res) => {
        setResults(res.searchUser || [])
      },
      onError: () => {
        setResults([])
      }
    }
  )

  const handleValueChange = useCallback(
    (value: string) => {
      setSearchQuery(value)

      if (value.trim().length > 0) {
        loadUsers({ variables: { param: value } })
        setIsOpen(true)
      } else {
        setResults([])
        setIsOpen(false)
      }
    },
    [loadUsers]
  )

  const handleSelect = (user: User) => {
    navigate(`/users/${user.id}`)
    setSearchQuery('')
    setResults([])
    setIsOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <Input
        name="search"
        value={searchQuery}
        onValueChange={handleValueChange}
        type="text"
        placeholder="Search..."
        variant="bordered"
        size="sm"
        radius="full"
        startContent={<MagnifyingGlassIcon className="w-6 h-6" />}
        className="w-full"
        classNames={{
          innerWrapper: 'px-3 py-1.5',
          input: 'text-sm bg-transparent',
          inputWrapper:
            'bg-transparent shadow-none group-data-[focus=true]:bg-transparent px-0 py-0 min-h-0 h-auto'
        }}
        aria-label="Search users"
      />

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : error ? (
            <div className="p-4 text-red-500 text-sm">Error fetching users</div>
          ) : results.length > 0 ? (
            results.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                onClick={() => handleSelect(user)}
              >
                <img
                  src={user.profile?.avatarUrl || 'https://thumb.ac-illust.com/51/51e1c1fc6f50743937e62fca9b942694_t.jpeg'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user.username}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-500 dark:text-gray-400 text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
