import { Button, Form, Input } from '@heroui/react'
import { Controller, useForm } from 'react-hook-form'
import PasswordInput from '~/components/ui/PasswordInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { gql, useMutation } from '@apollo/client/index.js'
import { useFetcher, useNavigate } from 'react-router'

const schema = z.object({
  emailOrUsername: z
    .string()
    .min(1, { message: 'Email or username is required' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
})

const LOGIN_MUT = gql`
  mutation login($emailOrUsername: String!, $password: String!) {
    login(input: { emailOrUsername: $emailOrUsername, password: $password }) {
      accessToken
      accessTokenExpiresIn
      refreshToken
      refreshTokenExpiresIn
      message
    }
  }
`

const SignInForm = () => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      emailOrUsername: '',
      password: ''
    },
    resolver: zodResolver(schema)
  })
  const [login, { error, client }] = useMutation(LOGIN_MUT)
  const fetcher = useFetcher()
  const navigate = useNavigate()

  const onSubmit = (data: z.infer<typeof schema>) => {
    client.clearStore()
    login({
      variables: {
        emailOrUsername: data.emailOrUsername,
        password: data.password
      },
      onCompleted: async (data) => {
        const formData = new FormData()
        formData.append('accessToken', data.login?.accessToken)
        formData.append(
          'accessTokenExpiresIn',
          data.login?.accessTokenExpiresIn
        )
        formData.append('refreshToken', data.login?.refreshToken)
        formData.append(
          'refreshTokenExpiresIn',
          data.login?.refreshTokenExpiresIn
        )
        await fetcher.submit(formData, {
          method: 'POST',
          action: '/api/auth/token'
        })
        navigate('/')
      },
      onError: (error) => {
        console.error('Login error:', error)
      }
    })
  }

  return (
    <Form className="w-full gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="emailOrUsername"
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

      {error && <p className="text-red-500">{error.message}</p>}
    </Form>
  )
}

export default SignInForm
