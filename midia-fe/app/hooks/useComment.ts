import type { CommentInput } from './../lib/graphql-types'
import { gql, useMutation, useQuery } from '@apollo/client/index.js'

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
      id
      content
      createdAt
      totalLikes
      author {
        id
        username
        profile {
          avatarUrl
        }
      }
    }
  }
`

export const LIKE_COMMENT = gql`
  mutation LikeComment($commentId: ID!) {
    likeComment(commentId: $commentId)
  }
`

export const UNLIKE_COMMENT = gql`
  mutation UnlikeComment($commentId: ID!) {
    unlikeComment(commentId: $commentId)
  }
`

export const GET_COMMENTS_BY_POST_ID = gql`
  query GetCommentsByPostId($postId: ID!, $first: Int!, $after: String) {
    post(postId: $postId) {
      id
      comments(first: $first, after: $after) {
        edges {
          node {
            id
            content
            createdAt
            totalLikes
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
          endCursor
        }
      }
    }
  }
`

export const useCreateComment = () => {
  const [createCommentMutation, { loading, error }] = useMutation(
    CREATE_COMMENT,
    {
      context: { requiresAuth: true }
    }
  )

  const createComment = async (input: CommentInput) => {
    const response = await createCommentMutation({ variables: { input } })
    return response.data?.createComment
  }

  return { createComment, isLoading: loading, error }
}

export const useLikeComment = () => {
  const [likeCommentMutation, { loading, error }] = useMutation(LIKE_COMMENT, {
    context: { requiresAuth: true }
  })

  const likeComment = async (commentId: string) => {
    const response = await likeCommentMutation({ variables: { commentId } })
    return response.data?.likeComment
  }

  return { likeComment, isLoading: loading, error }
}

export const useUnlikeComment = () => {
  const [unlikeCommentMutation, { loading, error }] = useMutation(
    UNLIKE_COMMENT,
    {
      context: { requiresAuth: true }
    }
  )

  const unlikeComment = async (commentId: string) => {
    const response = await unlikeCommentMutation({ variables: { commentId } })
    return response.data?.unlikeComment
  }

  return { unlikeComment, isLoading: loading, error }
}

export const useCommentsByPostId = (
  postId: string,
  first: number = 10,
  after?: string
) => {
  const skip = !postId
  const { data, loading, error, fetchMore, refetch } = useQuery(
    GET_COMMENTS_BY_POST_ID,
    {
      variables: { postId, first, after },
      context: { requiresAuth: true },
      errorPolicy: 'all',
      skip
    }
  )

  const commentsConnection = data?.post?.comments
  const comments = commentsConnection?.edges?.map((edge: any) => edge.node) || []
  const pageInfo = commentsConnection?.pageInfo

  const loadMoreComments = async () => {
    if (!pageInfo?.hasNextPage || !pageInfo?.endCursor) {
      return
    }

    await fetchMore({
      variables: {
        postId,
        first,
        after: pageInfo.endCursor
      },
      updateQuery: (prev: any, { fetchMoreResult }: any) => {
        if (!fetchMoreResult || !fetchMoreResult.post) return prev
        const newEdges = fetchMoreResult.post.comments.edges
        return {
          post: {
            ...prev.post,
            comments: {
              ...prev.post.comments,
              edges: [...prev.post.comments.edges, ...newEdges],
              pageInfo: fetchMoreResult.post.comments.pageInfo
            }
          }
        }
      }
    })
  }

  return {
    comments,
    pageInfo,
    isLoading: skip ? false : loading,
    error,
    loadMoreComments,
    refetchComments: refetch
  }
}