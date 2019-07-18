const express = require('express')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const { execute, subscribe } = require('graphql')
const { createServer } = require('http')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const bodyParser = require('body-parser')
const { setTimeout } = require('timers')
const cors = require('cors')
const jmri = require('./jmri')
const { PORT, CLIENT_URLS } = require('./constants')
const { schema } = require('./schema')

const app = express()
app.set('port', PORT)

const whitelist = CLIENT_URLS.split(',')
app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS: ' + origin))
      }
    },
  }),
)

app.use(
  '/api',
  bodyParser.json(),
  graphqlExpress({
    schema: schema,
  }),
)
app.get(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/api',
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
  }),
)

app.get('/', (req, res) =>
  res.send(
    'This is the JMRI GraphQL proxy API. Point your client to /api, or browse the API using GraphiQL at /graphiql',
  ),
)

app.get('/health-check', (req, res) => res.sendStatus(200))

app.use(express.static('static'))

// When running directly (rather than included for testing)...
if (require.main === module) {
  // Start JMRI websocket client
  jmri.init()

  // Start GraphQL websocket server
  const ws = createServer(app)
  ws.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`)
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server: ws,
        path: '/subscriptions',
      },
    )
  })
}

module.exports = app
