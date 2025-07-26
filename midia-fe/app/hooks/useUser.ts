import { gql, useQuery } from '@apollo/client/index.js'
import type { User } from '~/lib/graphql-types'

const GET_USER = gql`
  query User($userId: ID!) {
    user(userId: $userId) {
      id
      username
      role
      email
      profile {
        fullName
        phoneNumber
        birthDate
        bio
        avatarUrl
        username
      }
      stats {
        totalFollowings
        totalFollowers
        totalPosts
      }
    }
  }
`

const useUser = (userId: string) => {
  const { data, loading, error, refetch } = useQuery(GET_USER, {
    context: { requiresAuth: true },
    variables: { userId }
  })

  return {
    user: data?.user as User | undefined | null,
    loading,
    error,
    refetch
  }
}

export default useUser
