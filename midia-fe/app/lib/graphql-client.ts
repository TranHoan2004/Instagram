import {
  fromPromise,
  HttpLink,
  InMemoryCache,
  Observable,
  split,
  type FetchResult,
  type NextLink,
  type Operation
} from '@apollo/client/index.js'
import {
  createApolloLoaderHandler,
  ApolloClient
} from '@apollo/client-integration-react-router'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { getToken, refreshToken } from '~/services/auth.service'
import { relayStylePagination } from '@apollo/client/utilities'

const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_API_URL}/graphql`,
  credentials: 'include'
})

let isRefreshing = false
let pendingRequests: ((accessToken: string) => void)[] = []

const enqueueRequest = (callback: (accessToken: string) => void) => {
  pendingRequests.push(callback)
}

const resolvePendingRequests = (accessToken: string) => {
  pendingRequests.forEach((callback) => callback(accessToken))
  pendingRequests = []
}

const unAuthenticatedErrorHandler = onError(
  ({ graphQLErrors, operation, forward }) => {
    if (
      graphQLErrors?.some(
        (err) => err.extensions?.classification === 'UNAUTHENTICATED'
      )
    ) {
      return refresh(operation, forward)
    }
  }
)

const refresh = (operation: Operation, forward: NextLink) => {
  if (!isRefreshing) {
    isRefreshing = true
    return fromPromise(
      refreshToken()
        .then((accessToken) => {
          isRefreshing = false
          resolvePendingRequests(accessToken)
          return accessToken
        })
        .catch((err) => {
          console.error('Failed to refresh new token', err)
          isRefreshing = false
          pendingRequests = []
          // if (window) window.location.href = '/signin'
          throw err
        })
    ).flatMap((accessToken: string) => {
      const headers = operation.getContext().headers || {}
      operation.setContext({
        headers: {
          ...headers,
          Authorization: `Bearer ${accessToken}`
        }
      })

      return forward(operation)
    })
  } else {
    return new Observable((observer) => {
      enqueueRequest((accessToken) => {
        const headers = operation.getContext().headers || {}
        operation.setContext({
          headers: {
            ...headers,
            Authorization: `Bearer ${accessToken}`
          }
        })
        forward(operation).subscribe(observer)
      })
    }) as Observable<FetchResult>
  }
}

const authMiddleware = setContext(async (_, { headers }) => {
  const accessToken = await getToken()
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : ''
    }
  }
})

// Conditional auth based on operation context
const conditionalLink = split(
  (operation) => operation.getContext().requiresAuth === true,
  authMiddleware.concat(unAuthenticatedErrorHandler).concat(httpLink), // if requiresAuth, use authMiddleware
  httpLink
)

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        me: { merge: true },
        suggestUsers: relayStylePagination(),
        newsFeed: relayStylePagination()
      }
    }
  }
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const makeClient = (request?: Request) => {
  return new ApolloClient({
    cache: cache,
    link: conditionalLink
  })
}

export const apolloLoader = createApolloLoaderHandler(makeClient)
