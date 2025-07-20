import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Input } from '@heroui/react'
import { useState } from 'react'

export interface User {
  id: string
  username: string
  avatar: string
}

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [data, setData] = useState<User[]>([])
  const [isHovered, setIsHovered] = useState(false)

  const handleSearch = () => {
    const param = document.querySelector(
      "input[name='search']"
    ) as HTMLInputElement
    const query = param?.value
    setSearchQuery(query)
    searchByKeywords(query)
  }

  const searchByKeywords = async (param: string) => {
    const query = `query {
        searchUser(params: "${param}") {
          id
          username
          avatar
        }
      }`

    try {
      const response = await fetch(`http://localhost:8000/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query
        })
      })
      const content = await response.json()
      setData(param.length > 0 ? content.data.searchUser : [])
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <Input
        value={searchQuery}
        onChange={handleSearch}
        type="text"
        placeholder="Search..."
        variant="bordered"
        size="sm"
        radius="full"
        startContent={<MagnifyingGlassIcon className="size-6" />}
        className="relative"
        classNames={{
          base: 'w-full min-w-0 max-w-sm',
          innerWrapper: 'px-3 py-1.5',
          input: 'text-sm bg-transparent',
          inputWrapper:
            'bg-transparent shadow-none after:bg-transparent data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent px-0 py-0 min-h-0 h-auto'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Search"
        name="search"
      />
      {data.length !== 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          {data.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
              onClick={() => {
                setSearchQuery('')
                setData([])
              }}
            >
              <img
                src={user.avatar}
                alt='Profile'
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user.username}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Full Name Placeholder
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {data.length === 0 && isHovered && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 text-gray-500 dark:text-gray-400 text-sm">
            No results found
          </div>
        </div>
      )}
    </>
  )
}

export default SearchBar