import { HttpLink, InMemoryCache } from '@apollo/client/index.js'
import {
  createApolloLoaderHandler,
  ApolloClient
} from '@apollo/client-integration-react-router'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const makeClient = (request?: Request) => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: `${import.meta.env.VITE_API_URL}/graphql` })
  })
}

export const apolloLoader = createApolloLoaderHandler(makeClient)
