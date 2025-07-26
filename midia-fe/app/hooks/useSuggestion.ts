import {
  gql,
  useQuery,
  type WatchQueryFetchPolicy
} from '@apollo/client/index.js'
import type { Connection, User } from '~/lib/graphql-types'

const SUGGESTION = gql`
  query SuggestUsers($first: Int, $after: String) {
    suggestUsers(first: $first, after: $after) {
      edges {
        cursor
        node {
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
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`

interface Props {
  first?: number
  after?: string
  fetchPolicy?: WatchQueryFetchPolicy
  nextFetchPolicy?: WatchQueryFetchPolicy
}

const useSuggestUsers = ({
  first = 10,
  after,
  fetchPolicy,
  nextFetchPolicy
}: Props) => {
  const { data, loading, error, fetchMore, refetch } = useQuery(SUGGESTION, {
    variables: { first, after },
    context: { requiresAuth: true },
    fetchPolicy: fetchPolicy,
    nextFetchPolicy: nextFetchPolicy
  })

  const userConnection = data?.suggestUsers as Connection<User>

  const loadMore = () => {
    if (
      !userConnection?.pageInfo.hasNextPage ||
      !userConnection?.pageInfo.endCursor
    )
      return

    return fetchMore({
      variables: {
        first: first,
        after: userConnection?.pageInfo?.endCursor
      }
    })
  }

  return {
    edges: userConnection?.edges || [],
    pageInfo: userConnection?.pageInfo,
    loading,
    error,
    loadMore,
    refetch
  }
}

export default useSuggestUsers
