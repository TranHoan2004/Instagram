import React from 'react'

interface FormFieldProps {
  className: string
  text: string
  children: React.ReactNode
}

export const FormField = ({ className, text, children }: FormFieldProps) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row">
      <div className="w-full sm:w-[194px] sm:min-w-[194px] sm:text-right pr-2 mb-1 sm:mb-0">
        <label className={`font-semibold mb-0 block dark:text-gray-200 ${className}`}>
          {text}
        </label>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
