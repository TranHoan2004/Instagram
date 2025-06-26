import { Outlet } from 'react-router'
import { useState } from 'react'
import EditProfile from './EditProfile'

const navItems = [
  'Edit profile',
  'Push notifications',
  'Change password',
  'Privacy and security',
  'Blocked list',
  'Login activity',
  'Help',
  'Switch to personal account'
]

export const Setting = () => {
  const [selected, setSelected] = useState('Edit profile')

  return (
    <main className="flex flex-row min-h-screen">
      <aside className="w-1/4 border-r border-gray-300 dark:border-gray-700">
        <nav className="flex flex-col">
          <ul className="w-full">
            {navItems.map((item) => (
              <li
                key={item}
                onClick={() => setSelected(item)}
                className={`flex items-center h-10 cursor-pointer transition-colors group my-6   ${
                  selected === item ? 'font-semibold text-base' : 'font-normal text-sm'
                }`}
              >
                <div
                  className={`w-1 h-full ${
                    selected === item ? 'bg-black dark:bg-white' : 'bg-transparent'
                  }`}
                />
                <span className={`px-4 text-black dark:text-gray-300 ${
                  item === 'Switch to personal account'
                    ? 'text-blue-500 hover:underline dark:text-indigo-300'
                    : 'text-black dark:text-gray-300'
                }`}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <section className="flex-1 p-4 w-3/4">
        {selected === 'Edit profile' ? <EditProfile /> : <Outlet />}
      </section>
    </main>
  )
}
