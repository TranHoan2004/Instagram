import { Button, Form, Input } from '@heroui/react'
import { Controller, useForm } from 'react-hook-form'
import PasswordInput from '~/components/ui/PasswordInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  emailOrUserName: z
    .string()
    .min(1, { message: 'Email or username is required' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
})

const SignInForm = () => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      emailOrUserName: '',
      password: ''
    },
    resolver: zodResolver(schema)
  })

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log('Form submitted:', data)
  }

  return (
    <Form className='w-full max-w-lg gap-4' onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="emailOrUserName"
        render={({
          field: { name, value, onChange, onBlur, ref },
          fieldState: { invalid, error }
        }) => (
          <Input
            ref={ref}
            name={name}
            value={value}
            isInvalid={invalid}
            onChange={onChange}
            onBlur={onBlur}
            errorMessage={error?.message}
            validationBehavior="aria"
            isRequired
            label="Email or Username"
            type="text"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({
          field: { name, value, onChange, onBlur, ref },
          fieldState: { invalid, error }
        }) => (
          <PasswordInput
            ref={ref}
            name={name}
            value={value}
            isInvalid={invalid}
            onChange={onChange}
            onBlur={onBlur}
            errorMessage={error?.message}
            isRequired
          />
        )}
      />

      <Button color="danger" type="submit" fullWidth>
        Sign In
      </Button>
    </Form>
  )
}

export default SignInForm
