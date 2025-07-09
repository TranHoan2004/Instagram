import React, { useState } from 'react'
import { FormField } from './FormField'
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Textarea
} from '@heroui/react'

interface EditProfileProps {
  data: EditProfileData
  onChange: (data: Partial<EditProfileData>) => void
}

export interface EditProfileData {
  name: string
  username: string
  bio: string
  website: string
  email: string
  phoneNumber: string
  gender: string
  suggestion: boolean
  avatarUrl?: string
}

export default function EditProfile({ data, onChange }: EditProfileProps) {
  const [error, setError] = useState<{
    name?: string
    username?: string
    website?: string
    bio?: string
    email?: string
    phoneNumber?: string
    gender?: string
  }>({})

  const [username, setUsername] = useState(() => data.username || '')

  const params = `input: {
        userId: 6
        ${data.name ? `fullName: "${data.name}"` : ''}
        ${data.username ? `username: "${data.username}"` : ''}
        ${data.bio ? `bio: "${data.bio}"` : ''}
        ${data.website ? `website: "${data.website}"` : ''}
        ${data.email ? `email: "${data.email}"` : ''}
        ${data.phoneNumber ? `phoneNumber: "${data.phoneNumber}"` : ''}
        ${data.gender ? `gender: "${data}"` : ''}
        ${data.avatarUrl ? `avatarUrl: "${data.avatarUrl}"` : ''}
    }`

  const mutation = `mutation {
    editUserProfile(${params}) {
      avatarUrl
      fullName
      username
      bio
      phoneNumber
      birthDate
    }
  }`

  const handleSubmitForm = async () => {
    try {
      const response = await fetch(`http://localhost:8000/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: mutation
        })
      })
      const content = await response.json()
      const data = content.data
      if (data.editUserProfile) {
        onChange({
          name: data.editUserProfile.fullName,
          username: data.editUserProfile.username,
          bio: data.editUserProfile.bio,
          website: data.editUserProfile.website,
          email: data.editUserProfile.email,
          phoneNumber: data.editUserProfile.phoneNumber,
          avatarUrl: data.editUserProfile.avatarUrl
        })
        setUsername(data.editUserProfile.username)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="rounded-lg h-full">
      <div className="p-0">
        <div className="px-4 pt-4 pb-2">
          {/* Profile Header */}
          <div className="mb-4 flex flex-wrap md:flex-nowrap items-center gap-4">
            <div className="flex-shrink-0">
              {data.avatarUrl ? (
                <img
                  src={data.avatarUrl}
                  alt="Profile"
                  className="ml-[135px] w-[50px] h-[50px] rounded-full object-cover"
                />
              ) : (
                <div className="ml-[135px] bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600 w-[50px] h-[50px] rounded-full flex items-center justify-center text-white font-bold">
                  {username.at(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h5 className="mb-1 font-normal text-base dark:text-white">
                {username}
              </h5>
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
            label="Name"
            children={
              <>
                <Input
                  className="py-1"
                  value={data.name}
                  placeholder="Name"
                  onChange={(e) => {
                    onChange({ name: e.target.value })
                    setError((prev) => ({
                      ...prev,
                      name: ''
                    }))
                  }}
                />
                <div className="text-gray-500 dark:text-gray-400 mt-2 text-xs leading-tight">
                  Help people discover your account by using the name you're
                  known by: either your full name, nickname, or business name.
                </div>
                <p className="text-red-500 text-sm">{error.name}</p>
              </>
            }
          />

          {/* Username */}
          <FormField
            className="pt-2"
            label="Username"
            children={
              <>
                <Input
                  className="py-1"
                  value={data.username}
                  placeholder="Username"
                  onChange={(e) => {
                    onChange({ username: e.target.value })
                    setError((prev) => ({
                      ...prev,
                      username: ''
                    }))
                  }}
                />
                <div className="text-gray-500 dark:text-gray-400 mt-2 text-xs leading-tight">
                  In most cases, you'll be able to change your username back to{' '}
                  {username} for another 14 days.
                </div>
                <p className="text-red-500 text-sm">{error.username}</p>
              </>
            }
          />

          {/* Website */}
          <FormField
            className="pt-2"
            label="Website"
            children={
              <>
                <Input
                  className="py-1"
                  disabled
                  placeholder="Website"
                  value={data.website}
                  onChange={(e) => {
                    onChange({ website: e.target.value })
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
            label="Bio"
            children={
              <>
                <Textarea
                  isClearable
                  className="py-1 resize-y"
                  rows={3}
                  placeholder="Bio"
                  id="bioTextarea"
                  onChange={(e) => {
                    onChange({ bio: e.target.value })
                    setError((prev) => ({
                      ...prev,
                      bio: ''
                    }))
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
        <hr className="border-gray-300 dark:border-gray-700" />
        <div className="px-4 pt-4 pb-2">
          {/* Header */}
          <div className="mb-4 flex flex-col md:flex-row">
            <div className="md:w-1/4 pr-2" />
            <div className="flex-1">
              <h6 className="text-gray-600 dark:text-white font-semibold mb-2">
                Personal information
              </h6>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Provide your personal information. This won't be part of your
                public profile.
              </p>
            </div>
          </div>

          {/* Email */}
          <FormField
            className="mt-2"
            label="Email"
            children={
              <>
                <Input
                  type="email"
                  className="py-1 w-full"
                  placeholder="Email"
                  value={data.email}
                  onChange={(e) => {
                    onChange({ email: e.target.value })
                    setError((prev) => ({
                      ...prev,
                      email: ''
                    }))
                  }}
                />
                <p className="text-red-500 text-sm mt-1">{error.email}</p>
              </>
            }
          />

          {/* Phone number */}
          <FormField
            className="mt-2"
            label="Phone number"
            children={
              <>
                <Input
                  type="tel"
                  className="py-1 w-full"
                  value={data.phoneNumber}
                  placeholder="Phone number"
                  onChange={(e) => {
                    onChange({ phoneNumber: e.target.value })
                    setError((prev) => ({
                      ...prev,
                      phoneNumber: ''
                    }))
                  }}
                />
                <p className="text-red-500 text-sm mt-1">{error.phoneNumber}</p>
              </>
            }
          />

          {/* Gender */}
          <FormField
            className="mt-2"
            label="Gender"
            children={
              <>
                <Select
                  className="py-1 w-full"
                  placeholder="Select gender"
                  selectedKeys={new Set(data.gender ? [data.gender] : [])}
                  onChange={(e) => {
                    onChange({ gender: e.target.value })
                    setError((prev) => ({ ...prev, gender: '' }))
                  }}
                >
                  <SelectItem key="">Prefer not to say</SelectItem>
                  <SelectItem key="male">Male</SelectItem>
                  <SelectItem key="female">Female</SelectItem>
                </Select>
                <p className="text-red-500 text-sm mt-1">{error.gender}</p>
              </>
            }
          />

          {/* Suggestion */}
          <FormField
            className="suggestion"
            label="Show account suggestions"
            children={
              <div className="form-check d-flex align-items-start">
                <Checkbox
                  isSelected={data.suggestion}
                  onValueChange={(value) => onChange({ suggestion: value })}
                />
                <span className="text-sm leading-1-43 dark:text-gray-400">
                  Choose whether people can see similar account suggestions on
                  your profile, and your account suggested on other profiles.
                </span>
              </div>
            }
          />
        </div>
        <div className="p-4 flex justify-center items-center gap-3">
          <Button color="primary" onClick={handleSubmitForm} type="button">
            Submit
          </Button>
          <a
            href="#"
            className="text-blue-500 no-underline text-sm dark:text-blue-400"
          >
            Temporarily deactivate my account
          </a>
        </div>
      </div>
    </div>
  )
}
