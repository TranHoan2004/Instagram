import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { Input } from '@heroui/react'
import React, { useState } from 'react'

interface PasswordInputProps {
  ref?: React.RefCallback<HTMLInputElement>
  label?: string
  name?: string
  value?: string
  isInvalid?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  errorMessage?: string
  isRequired?: boolean
}

const PasswordInput = ({
  ref,
  name,
  value,
  isInvalid,
  onChange,
  onBlur,
  errorMessage,
  label = 'Password',
  isRequired = false
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false)

  const toggleVisible = () => setVisible(!visible)

  return (
    <Input
      endContent={
        <button
          type="button"
          className="focus:outline-none"
          onClick={toggleVisible}
        >
          {visible ? (
            <EyeSlashIcon className="size-6" />
          ) : (
            <EyeIcon className="size-6" />
          )}
        </button>
      }
      ref={ref}
      name={name}
      value={value}
      isInvalid={isInvalid}
      onChange={onChange}
      onBlur={onBlur}
      errorMessage={errorMessage}
      type={visible ? 'text' : 'password'}
      validationBehavior="aria"
      isRequired={isRequired}
      label={label}
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
    />
  )
}

export default PasswordInput
