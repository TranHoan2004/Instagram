import { gql, useMutation, useQuery } from '@apollo/client/index.js'
import {
  Sort,
  type Connection,
  type CreatePostInput,
  type Post
} from '~/lib/graphql-types'

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      post {
        id
        caption
        visibility
        createdAt
        updatedAt
      }
      message
    }
  }
`

export const GET_POSTS_BY_AUTHOR = gql`
  query GetPostsByAuthor(
    $userId: ID!
    $first: Int
    $after: String
    $sort: Sort
  ) {
    postsByUser(userId: $userId, first: $first, after: $after, sort: $sort) {
      edges {
        node {
          id
          caption
          visibility
          createdAt
          updatedAt
          totalLikes
          totalComments
          createdAt
          author {
            id
            username
          }
          attachments {
            id
            originalLink
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

export const NEWS_FEED = gql`
  query NewsFeed($first: Int, $after: String) {
    newsFeed(first: $first, after: $after) {
      edges {
        node {
          id
          caption
          visibility
          createdAt
          totalLikes
          totalComments
          attachments {
            id
            originalLink
          }
          author {
            id
            username
            profile {
              avatarUrl
            }
          }
        }
        cursor
      }

      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

export const useCreatePost = () => {
  const [createPostMutation, { loading, error }] = useMutation(CREATE_POST, {
    context: { requiresAuth: true }
  })

  const createPost = async (postData: CreatePostInput) => {
    const variables = {
      input: {
        caption: postData.caption || '',
        visibility: postData.visibility || 'PUBLIC',
        attachmentIds: postData.attachmentIds || []
        // taggedUsers: postData.taggedUsers || []
      }
    }
    const response = await createPostMutation({ variables })
    return response.data?.createPost
  }

  return { createPost, isLoading: loading, error }
}

export const usePostsByAuthorId = (
  authorId: string,
  first: number = 10,
  after?: string,
  sort: Sort = Sort.DESC
) => {
  // Nếu authorId rỗng thì không gọi query, trả về mảng rỗng
  const skip = !authorId
  const { data, loading, error, fetchMore } = useQuery(GET_POSTS_BY_AUTHOR, {
    variables: { userId: authorId, first, after, sort },
    context: { requiresAuth: true },
    errorPolicy: 'all',
    skip
  })

  const postsConnection = data?.postsByUser as Connection<Post>

  const loadMore = async () => {
    if (
      !postsConnection?.pageInfo.hasNextPage ||
      !postsConnection?.pageInfo.endCursor
    ) {
      return
    }

    return await fetchMore({
      variables: {
        userId: authorId,
        first,
        after: postsConnection.pageInfo.endCursor,
        sort
      },
      updateQuery: (prev: any, { fetchMoreResult }: any) => {
        if (!fetchMoreResult) return prev
        return {
          postsByUser: {
            __typename: prev.postsByUser.__typename,
            edges: [
              ...prev.postsByUser.edges,
              ...fetchMoreResult.postsByUser.edges
            ],
            pageInfo: fetchMoreResult.postsByUser.pageInfo
          }
        }
      }
    })
  }

  return {
    edges: postsConnection?.edges || [],
    pageInfo: postsConnection?.pageInfo,
    isLoading: skip ? false : loading,
    error,
    loadMore,
    fetchMore
  }
}

export const useNewsFeed = ({
  first = 10,
  after
}: {
  first?: number
  after?: string
}) => {
  const { data, loading, error, fetchMore, refetch } = useQuery(NEWS_FEED, {
    context: { requiresAuth: true },
    variables: { first: first, after: after },
    errorPolicy: 'all'
  })

  const postConnection = data?.newsFeed as Connection<Post>

  const loadMore = () => {
    if (
      !postConnection?.pageInfo.hasNextPage ||
      !postConnection?.pageInfo.endCursor
    )
      return

    return fetchMore({
      variables: {
        first: first,
        after: postConnection?.pageInfo?.endCursor
      }
    })
  }

  return {
    edges: postConnection?.edges || [],
    pageInfo: postConnection?.pageInfo,
    loading,
    error,
    loadMore,
    refetch
  }
}
