const { createStore, applyMiddleware } = require('redux')
const thunk = require('redux-thunk').default
const rootReducer = require('./reducers')
const { createLogger } = require('redux-logger')

const logger = createLogger({
  logger: {
    log(type, color, value) {
      type = type.replace('%c', '')
      const exclude = false
      // console.log('Redux:', type, value || '')
    },
  },
})
let store = createStore(
  rootReducer,
  applyMiddleware(thunk),
  applyMiddleware(logger),
)

module.exports = store
