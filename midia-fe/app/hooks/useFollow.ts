import { gql, useMutation } from '@apollo/client/index.js'

const TOGGLE_FOLLOW = gql`
  mutation ToggleFollow($targetUserId: ID!) {
    toggleFollow(targetUserId: $targetUserId)
  }
`

const useFollow = () => {
  const [toggleFollow, { loading, error }] = useMutation(TOGGLE_FOLLOW, {
    context: { requiresAuth: true }
  })

  return {
    toggleFollow,
    isLoading: loading,
    error
  }
}

export default useFollow
