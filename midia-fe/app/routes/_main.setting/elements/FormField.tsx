import React from 'react'

interface FormFieldProps {
  className?: string
  label: string
  children: React.ReactNode
}

export const FormField = ({ className, label, children }: FormFieldProps) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row">
      <div className="w-1/4 text-right pr-2 mb-1 sm:mb-0">
        <label
          className={`font-semibold block dark:text-gray-200 ${className}`}
        >
          {label}
        </label>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
