import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'
import { makeClient } from './lib/graphql-client'
import { ApolloProvider } from '@apollo/client/index.js'

startTransition(() => {
  const graphQLClient = makeClient()

  hydrateRoot(
    document,
    <StrictMode>
      <ApolloProvider client={graphQLClient}>
        <HydratedRouter />
      </ApolloProvider>
    </StrictMode>
  )
})
