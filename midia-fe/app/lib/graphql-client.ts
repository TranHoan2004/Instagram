import {
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
  split
} from '@apollo/client/index.js'
import {
  createApolloLoaderHandler,
  ApolloClient
} from '@apollo/client-integration-react-router'

const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_API_URL}/graphql`,
  credentials: 'include'
})

const authMiddleware = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    fetch('/api/auth/token')
      .then((resp) => resp.json())
      .then((data) => {
        const accessToken = data.accessToken

        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            Authorization: accessToken ? `Bearer ${accessToken}` : ''
          }
        }))

        const subscriber = {
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer)
        }

        forward(operation).subscribe(subscriber)
      })
      .catch((err) => {
        observer.error(err)
      })
  })
})

// Conditional auth based on operation context
const conditionalLink = split(
  (operation) => operation.getContext().requiresAuth === true,
  authMiddleware.concat(httpLink), // if requiresAuth, use authMiddleware
  httpLink
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const makeClient = (request?: Request) => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: conditionalLink
  })
}

export const apolloLoader = createApolloLoaderHandler(makeClient)
