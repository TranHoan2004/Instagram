import React, { useState } from 'react'
import { Input, Textarea } from '@heroui/react'
import { FormField } from '~/components/setting/elements/FormField'

export const BasicInformation = () => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('Hehehe')
  const [website, setWebsite] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<{
    name?: string
    username?: string
    website?: string
    bio?: string
  }>({})

  return (
    <>
      <div className="px-4 pt-4 pb-2 dark:bg-gray-900">
        {/* Profile Header */}
        <div className="mb-4 flex flex-wrap md:flex-nowrap items-center gap-4">
          <div className="flex-shrink-0">
            <div className="ml-[135px] bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600 w-[50px] h-[50px] rounded-full flex items-center justify-center text-white font-bold">
              {username.at(0)?.toUpperCase()}
            </div>
          </div>
          <div>
            <h5 className="mb-1 font-normal text-base dark:text-white">{username}</h5>
            <a
              href="#"
              className="text-blue-500 no-underline font-bold text-sm dark:text-blue-400"
            >
              Change profile photo
            </a>
          </div>
        </div>

        {/* Name */}
        <FormField
          className="pt-2"
          text="Name"
          children={
            <>
              <Input
                className="py-1"
                value={name}
                placeholder="Name"
                onChange={(e) => {
                  setName(e.target.value)
                  setError((prev) => ({
                    ...prev,
                    name: ''
                  }))
                }}
              />
              <div className="text-gray-500 dark:text-gray-400 mt-2 text-xs leading-tight">
                Help people discover your account by using the name you're known
                by: either your full name, nickname, or business name.
                <br />
                <br />
                You can only change your name twice within 14 days.
              </div>
              <p className="text-red-500 text-sm">{error.name}</p>
            </>
          }
        />

        {/* Username */}
        <FormField
          className="pt-2"
          text="Username"
          children={
            <>
              <Input
                className="py-1"
                value={username}
                placeholder="Username"
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError((prev) => ({
                    ...prev,
                    username: ''
                  }))
                }}
              />
              <div className="text-gray-500 dark:text-gray-400 mt-2 text-xs leading-tight">
                In most cases, you'll be able to change your username back to{' '}
                {username} for another 14 days.
                <a href="#" className="text-blue-500 no-underline mx-1 dark:text-blue-400 hover:underline">
                  Learn more
                </a>
              </div>
              <p className="text-red-500 text-sm">{error.username}</p>
            </>
          }
        />

        {/* Website */}
        <FormField
          className="pt-2"
          text="Website"
          children={
            <>
              <Input
                className="py-1"
                disabled
                placeholder="Website"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value)
                  setError((prev) => ({
                    ...prev,
                    website: ''
                  }))
                }}
              />
              <div className="text-gray-500 dark:text-gray-400 mt-2 text-xs leading-tight">
                Editing your links is only available on mobile. Visit the
                Instagram app and edit your profile to change the websites in
                your bio.
              </div>
              <p className="text-red-500 text-sm">{error.website}</p>
            </>
          }
        />

        {/* Bio */}
        <FormField
          className="pt-2"
          text="Bio"
          children={
            <>
              <Textarea
                isClearable
                className="py-1 resize-y"
                rows={3}
                placeholder="Bio"
                id="bioTextarea"
                onChange={(e) => {
                  setBio(e.target.value)
                  setError((prev) => ({
                    ...prev,
                    bio: ''
                  }))
                  console.log(bio)
                }}
              />
              <div className="flex mt-1">
                <small
                  className="text-gray-500 dark:text-gray-400 text-xs leading-tight"
                  id="charCount"
                >
                  0 / 150
                </small>
              </div>
              <p className="text-red-500 text-sm">{error.bio}</p>
            </>
          }
        />
      </div>
    </>
  )
}
