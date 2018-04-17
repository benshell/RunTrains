import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import { createLogger } from 'redux-logger'

const logger = createLogger({
  logger: {
    log(type, color, value) {
      type = type.replace('%c', '')
      const exclude = false
      // console.log('Redux:', type, value || '')
    },
  },
})
let store = createStore(rootReducer, applyMiddleware(thunk), applyMiddleware(logger))

export default store
