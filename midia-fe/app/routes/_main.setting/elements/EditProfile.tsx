import React, { useState } from 'react'
import { FormField } from './FormField'
import {
  addToast,
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  type ToastProps,
  useDisclosure
} from '@heroui/react'
import { useAuth } from '~/contexts/AuthContext'
import { getToken } from '~/services/auth.service'

interface ProfileProps {
  name: string,
  username: string,
  bio: string,
  website: string,
  email: string,
  phoneNumber: string,
  gender: string,
  avatarUrl: null | string | FormData,
  suggestion: boolean
}

export default function EditProfile() {
  const [data, setData] = useState<ProfileProps>({
    name: '',
    username: '',
    bio: '',
    website: '',
    email: '',
    phoneNumber: '',
    gender: '',
    avatarUrl: '',
    suggestion: false
  })
  const [error, setError] = useState<{
    name?: string
    username?: string
    website?: string
    bio?: string
    email?: string
    phoneNumber?: string
    gender?: string
  }>({})
  const { user, updateUser } = useAuth()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  // const [placement, setPlacement] = useState<ToastPlacement>("bottom-right");

  const buildEditProfileMutation = (userId: string, input: Partial<ProfileProps>) => {
    const fields = Object.entries(input)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n')

    return `
    mutation {
      context: {
        requiresAuth: true
      }
      editUserProfile(input: {
        userId: "${userId}"
        ${fields}
      },
      context: {
        requiresAuth: true
      }) {
        avatarUrl
        fullName
        username
        bio
        phoneNumber
        birthDate
      }
    }
  `
  }

  const createToast = (
    title: string,
    description: string,
    type: ToastProps['color']
  ) => {
    addToast({
      title: title,
      description: description,
      timeout: 4000,
      shouldShowTimeoutProgress: true,
      color: type,
      variant: 'flat'
    })
  }

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const mutation = buildEditProfileMutation(user?.id ?? '', data)
    const result = await updateProfileApi(mutation)

    const profile = result?.data?.editUserProfile
    if (profile) {
      updateUser({
        username: profile.username,
        email: profile.email,
        profile: {
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          phoneNumber: profile.phoneNumber
        }
      })

      setData({
        name: '',
        username: '',
        bio: '',
        website: '',
        email: '',
        phoneNumber: '',
        gender: '',
        avatarUrl: '',
        suggestion: false
      })

      createToast('Successfully!', 'Update your profile successfully.', 'success')
    }
  }

  const handleUploadPhoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onClose: () => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await sendFileToServer(file)

    if (result) {
      updateUser({
        profile: {
          fullName: user?.profile?.fullName ?? '',
          avatarUrl: result
        }
      })
      createToast('Success', 'Avatar updated successfully.', 'success')
    } else {
      createToast('Error', 'Failed to update avatar.', 'danger')
    }

    onClose()
  }

  const sendFileToServer = async (file: File | null) => {
    const formData = new FormData()
    if (file) {
      formData.append('avatar', file)
    }
    formData.append('userId', user?.id ?? '')

    const result = await uploadPhotoApi(formData)

    return result?.userProfile
  }

  const handleRemovePhoto = async (onClose: () => void) => {
    const result = await sendFileToServer(null)

    if (result) {
      updateUser({
        profile: {
          fullName: user?.profile?.fullName ?? '',
          avatarUrl: ''
        }
      })
      createToast('Successfully!', 'Removed your profile photo.', 'success')
    } else {
      createToast('Error', 'Failed to remove avatar.', 'danger')
    }

    onClose()
  }

  const updateProfileApi = async (mutation: string) => {
    try {
      const res = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: mutation })
      })

      return await res.json()
    } catch (error) {
      console.error('Error during update profile:', error)
      createToast('Error', 'Failed to update profile.', 'warning')
    }
  }

  const uploadPhotoApi = async (formData: FormData) => {
    const token = await getToken()

    const res = await fetch('http://localhost:8000/api/v1/edit_avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const content = await res.json()
    return content
  }

  return (
    <div className="rounded-lg h-full">
      {/*<ToastProvider placement={placement} />*/}
      <form className="p-0" onSubmit={handleSubmitForm}>
        <div className="px-4 pt-4 pb-2">
          {/* Profile Header */}
          <div
            className="mb-4 flex flex-wrap md:flex-nowrap items-center gap-4">
            <div className="flex-shrink-0">
              {user?.profile?.avatarUrl?.trim() ? (
                <img
                  src={user?.profile?.avatarUrl}
                  alt="Profile"
                  className="ml-[135px] w-[50px] h-[50px] rounded-full object-cover"
                />
              ) : (
                <div
                  className="ml-[135px] bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600 w-[50px] h-[50px] rounded-full flex items-center justify-center text-white font-bold">
                  {user?.username.at(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h5 className="mb-1 font-normal text-base dark:text-white">
                {user?.username}
              </h5>
              <Button
                as="a"
                className="!p-0 !m-0 !min-h-0 !h-auto !border-0 !bg-transparent !font-inherit
                      text-blue-500 no-underline font-bold text-sm dark:text-blue-400"
                onPress={onOpen}
              >
                Change profile photo
              </Button>
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
                    setData((prev) => ({
                      ...prev,
                      name: e.target.value
                    }))
                    setError((prev) => ({
                      ...prev,
                      name: ''
                    }))
                  }}
                />
                <div
                  className="text-gray-500 dark:text-gray-400 mt-2 text-xs leading-tight">
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
                    setData((prev) => ({
                      ...prev,
                      username: e.target.value
                    }))
                    setError((prev) => ({
                      ...prev,
                      username: ''
                    }))
                  }}
                />
                <div
                  className="text-gray-500 dark:text-gray-400 mt-2 text-xs leading-tight">
                  In most cases, you'll be able to change your username back
                  to{' '}
                  {user?.username} for another 14 days.
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
                    setData((prev) => ({
                      ...prev,
                      website: e.target.value
                    }))
                    setError((prev) => ({
                      ...prev,
                      website: ''
                    }))
                  }}
                />
                <div
                  className="text-gray-500 dark:text-gray-400 mt-2 text-xs leading-tight">
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
                    setData((prev) => ({
                      ...prev,
                      bio: e.target.value
                    }))
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
                    setData((prev) => ({
                      ...prev,
                      email: e.target.value
                    }))
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
                    setData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value
                    }))
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
                    setData((prev) => ({
                      ...prev,
                      gender: e.target.value
                    }))
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
                  onValueChange={(value) =>
                    setData((prev) => ({
                      ...prev,
                      suggestion: value
                    }))
                  }
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
          <Button color="primary" type="submit">
            Submit
          </Button>
          <a
            href="#"
            className="text-blue-500 no-underline text-sm dark:text-blue-400"
          >
            Temporarily deactivate my account
          </a>
        </div>
      </form>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="text-center">
          {(onClose) => (
            <>
              <ModalHeader
                className="w-full border-b border-gray-200
                          py-3 text-center font-semibold
                          flex justify-center items-center"
              >
                Change your avatar
              </ModalHeader>
              <ModalBody className="p-0 pt-3">
                <Button
                  disableAnimation
                  className="!min-h-0 !h-auto !p-0 !m-0 !border-0 !bg-transparent !font-inherit
                    text-blue-500 no-underline font-bold text-sm dark:text-blue-400"
                  onPress={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      if (e.target instanceof HTMLInputElement) {
                        handleUploadPhoto({ target: e.target } as React.ChangeEvent<HTMLInputElement>, onClose)
                      }
                    }
                    input.click()
                  }}
                >
                  Upload photo
                </Button>
                <hr className="border-gray-200" />
                <Button
                  disableAnimation
                  className="!min-h-0 !h-auto !p-0 !m-0 !border-0 !bg-transparent !font-inherit
                      text-red-500 no-underline font-bold text-sm dark:text-red-500"
                  onPress={() => {
                    handleRemovePhoto(onClose)
                  }}
                >
                  Remove current photo
                </Button>
                <hr className="border-gray-200" />
                <Button
                  as="a"
                  className="!min-h-0 !h-auto pb-3 !bg-transparent !font-inherit
                      no-underline font-bold text-sm dark:text-white"
                  onPress={onClose}
                >
                  Cancel
                </Button>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
