import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Input } from '@heroui/react'
import { useState } from 'react'

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)
  }

  return (
    <Input
      value={searchQuery}
      onChange={handleSearch}
      type="text"
      placeholder="Search..."
      variant="bordered"
      size="sm"
      radius="full"
      startContent={<MagnifyingGlassIcon className="size-6 text-gray-400" />}
      className="relative"
      classNames={{
        base: 'w-full min-w-0 max-w-sm',
        innerWrapper: 'px-3 py-1.5',
        input:
          'text-sm bg-transparent text-gray-800 dark:text-gray-100 placeholder:text-gray-400',
        inputWrapper:
          'border border-foreground-400 bg-transparent shadow-none after:bg-transparent data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent px-0 py-0 min-h-0 h-auto'
      }}
      aria-label="Search"
    />
  )
}

export default SearchBar
