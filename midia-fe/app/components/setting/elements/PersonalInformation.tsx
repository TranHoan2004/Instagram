import React, { useState } from 'react'
import { Checkbox, Input, Select, SelectItem } from '@heroui/react'
import { FormField } from '~/components/setting/elements/FormField'

export const PersonalInformation = () => {
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState('')
  const [suggestion, setSuggestion] = useState(false)

  const [error, setError] = useState<{
    email?: string
    phoneNumber?: string
    gender?: string
  }>({})
  console.log(suggestion)

  return (
    <>
      <div className="px-4 pt-4 pb-2 dark:bg-gray-900">
        {/* Header */}
        <div className="mb-4 flex flex-col md:flex-row">
          <div className="md:w-1/4 pr-2"/>
          <div className="flex-1">
            <h6 className="text-gray-600 dark:text-white font-semibold mb-2">
              Personal information
            </h6>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Provide your personal information, even if the account is used for
              a business, a pet or something else. This won't be part of your
              public profile.
            </p>
          </div>
        </div>

        {/* Email */}
        <FormField
          className="mt-2"
          text="Email"
          children={
            <>
              <Input
                type="email"
                className="py-1 w-full"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
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
          text="Phone number"
          children={
            <>
              <Input
                type="tel"
                className="py-1 w-full"
                value={phoneNumber}
                placeholder="Phone number"
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
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
          text="Gender"
          children={
            <>
              <Select
                className="py-1 w-full"
                placeholder="Select gender"
                selectedKeys={new Set(gender ? [gender] : [])}
                onChange={(e) => {
                  setGender(e.target.value)
                  setError((prev) => ({ ...prev, gender: '' }))
                }}
              >
                <SelectItem key="">Prefer not to say</SelectItem>
                <SelectItem key="male">Male</SelectItem>
                <SelectItem key="female">Female</SelectItem>
                <SelectItem key="custom">Custom</SelectItem>
              </Select>
              <p className="text-red-500 text-sm mt-1">{error.gender}</p>
            </>
          }
        />

        {/* Suggestion */}
        <FormField
          className="suggestion"
          text="Show account suggestions on profiles"
          children={
            <div className="form-check d-flex align-items-start">
              <Checkbox isSelected={suggestion} onValueChange={setSuggestion} />
              <span className="text-sm leading-1-43 dark:text-gray-400">
                Choose whether people can see similar account suggestions on
                your profile, and whether your account can be suggested on other
                profiles.
              </span>
            </div>
          }
        />
      </div>
    </>
  )
}
