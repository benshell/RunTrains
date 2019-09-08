import React from 'react'
import ReactDOM from 'react-dom'
import { split } from 'apollo-link'
import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { withClientState } from 'apollo-link-state'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider } from 'react-apollo'
import { onError } from 'apollo-link-error'
import 'typeface-roboto'
import './index.css'
import { SERVER_HOST, SERVER_PORT, SERVER_SSL } from './constants.js'
import App from './App'
import StatusMessages from './StatusMessages'
// import registerServiceWorker from './registerServiceWorker'
import { NETWORK_STATUS } from './queries'

const cache = new InMemoryCache()

const errorLink = onError(({ operation, graphQLErrors, networkError }) => {
  const { cache } = operation.getContext()
  if (graphQLErrors) {
    graphQLErrors.map(({ message }) =>
      console.error(`[GraphQL error]: ${message}`),
    )
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`)
    const existing = cache.readQuery({ query: NETWORK_STATUS })
    const data = {
      networkStatus: {
        __typename: 'NetworkStatus',
        errors: existing.status.errors + 1,
        message: `${networkError}`,
      },
    }
    cache.writeData({ data })
  }
})

const stateLink = withClientState({
  cache,
  resolvers: {
    Mutation: {
      updateNetworkStatus: (_, { errors, message }, { cache }) => {
        const data = {
          networkStatus: {
            __typename: 'NetworkStatus',
            errors,
            message,
          },
        }
        cache.writeData({ data })
        return null
      },
    },
  },
  defaults: {
    networkStatus: {
      __typename: 'NetworkStatus',
      errors: 0,
      message: '',
    },
  },
})

const httpLink = new HttpLink({
  uri: `http${SERVER_SSL ? 's' : ''}://${SERVER_HOST}:${SERVER_PORT}/api`,
})

const wsLink = new WebSocketLink({
  uri: `ws${
    SERVER_SSL ? 's' : ''
  }://${SERVER_HOST}:${SERVER_PORT}/subscriptions`,
  options: {
    reconnect: true,
    reconnectionAttempts: 99999,
  },
})

const serverLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink,
)

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([errorLink, stateLink, serverLink]),
})

const ApolloApp = (
  <ApolloProvider client={client}>
    <React.Fragment>
      <StatusMessages />
      <App />
    </React.Fragment>
  </ApolloProvider>
)

ReactDOM.render(ApolloApp, document.getElementById('root'))
// registerServiceWorker()
