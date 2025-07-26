import { gql, useMutation } from '@apollo/client/index.js'
import { CalendarIcon } from '@heroicons/react/24/outline'
import {
  Button,
  DateInput,
  Form,
  Input,
  Link,
  type DateValue
} from '@heroui/react'
import { Controller, useForm } from 'react-hook-form'
import PasswordInput from '~/components/ui/PasswordInput'
import type { RegisterUserInput, RegisterUserResp } from '~/lib/graphql-types'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useNavigate } from 'react-router'

const schema = z.object({
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string(),
  dob: z
    .custom<DateValue | null>((val) => val !== null, {
      message: 'Date of birth is required'
    })
    .superRefine((val, ctx) => {
      if (!val) {
        ctx.addIssue({
          code: 'custom',
          message: 'Date of birth is required',
          path: ctx.path
        })
        return z.NEVER
      }
    })
    .transform((val) => {
      return val ? format(val.toString(), 'yyyy-MM-dd') : ''
    })
})

const REGISTRATION_MUT = gql`
  mutation register($input: RegisterUserInput!) {
    registerUser(input: $input) {
      id
      message
    }
  }
`

const SignUpForm = () => {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      username: '',
      dob: null
    }
  })
  const [register, { error: registerError, loading }] = useMutation<
    RegisterUserResp,
    RegisterUserInput
  >(REGISTRATION_MUT)

  const navigate = useNavigate()

  const onSubmit = (data: z.infer<typeof schema>) => {
    register({
      variables: { input: data },
      onCompleted: () => {
        sessionStorage.setItem('verify-email', data.email)
        navigate('/email-verify')
      }
    })
  }

  return (
    <Form className="w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-2 w-full">
        <Controller
          control={control}
          name="firstName"
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error }
          }) => (
            <Input
              ref={ref}
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              isInvalid={invalid}
              errorMessage={error?.message}
              validationBehavior="aria"
              isRequired
              label="First Name"
              type="text"
            />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error }
          }) => (
            <Input
              ref={ref}
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              isInvalid={invalid}
              errorMessage={error?.message}
              validationBehavior="aria"
              label="Last Name"
              type="text"
            />
          )}
        />
      </div>
      <Controller
        control={control}
        name="email"
        render={({
          field: { name, value, onChange, onBlur, ref },
          fieldState: { invalid, error }
        }) => (
          <Input
            ref={ref}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            isInvalid={invalid}
            errorMessage={error?.message}
            validationBehavior="aria"
            isRequired
            label="Email"
            type="email"
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
            onChange={onChange}
            onBlur={onBlur}
            isInvalid={invalid}
            errorMessage={error?.message}
            isRequired={true}
            label="Password"
          />
        )}
      />

      <Controller
        control={control}
        name="username"
        render={({
          field: { name, value, onChange, onBlur, ref },
          fieldState: { invalid, error }
        }) => (
          <Input
            ref={ref}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            isInvalid={invalid}
            errorMessage={error?.message}
            validationBehavior="aria"
            isRequired
            label="Username"
            type="text"
          />
        )}
      />

      <Controller
        control={control}
        name="dob"
        render={({
          field: { name, value, onChange, onBlur, ref },
          fieldState: { invalid, error }
        }) => (
          <DateInput
            endContent={<CalendarIcon className="size-6" />}
            ref={ref}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            isInvalid={invalid}
            errorMessage={error?.message}
            validationBehavior="aria"
            isRequired
            label="Date of Birth"
          />
        )}
      />

      <p className="text-sm text-gray-500">
        By signing up, you agree to our{' '}
        <Link className="hover:underline text-primary text-sm" href="/terms">
          Terms
        </Link>
        ,{' '}
        <Link
          className="hover:underline text-primary text-sm"
          href="/privacy-policy"
        >
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link
          className="hover:underline text-primary text-sm"
          href="/cookies-policy"
        >
          Cookies Policy
        </Link>{' '}
        .
      </p>

      <Button
        type="submit"
        color="danger"
        fullWidth
        className="mt-2"
        radius="sm"
        disabled={loading}
      >
        Sign Up
      </Button>

      {registerError && <p className="text-red-500">{registerError.message}</p>}
    </Form>
  )
}

export default SignUpForm
