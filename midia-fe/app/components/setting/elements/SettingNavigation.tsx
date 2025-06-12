import { useState } from 'react'

const navItems = [
  'Edit profile',
  'Professional account',
  'Change password',
  'Apps and websites',
  'Email notifications',
  'Push notifications',
  'Manage contacts',
  'Privacy and security',
  'Ads',
  'Supervision',
  'Login activity',
  'Emails from Instagram',
  'Help',
  'Switch to personal account'
]

export const SettingNavigation = () => {
  const [selected, setSelected] = useState('Edit profile')

  return (
    <nav className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between h-full">
      <div className="flex-1 flex flex-col justify-center items-start">
        <ul className="flex flex-col gap-y-4 w-full">
          {navItems.map((item) => (
            <li
              key={item}
              onClick={() => setSelected(item)}
              className={`flex items-center h-[40px] cursor-pointer transition-colors group ${
                selected === item
                  ? 'bg-white dark:bg-black font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {/* Đường kẻ trái */}
              <div
                className={`w-[4px] h-full ${
                  selected === item
                    ? 'bg-black dark:bg-white'
                    : 'bg-transparent'
                }`}
              />
              <div
                className={`px-4 text-sm text-black dark:text-gray-300 whitespace-nowrap mx-2 ${
                  item === 'Switch to personal account'
                    ? 'text-blue-500 hover:underline dark:text-indigo-300'
                    : 'text-black dark:text-gray-300'
                }`}
              >
                {item}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
