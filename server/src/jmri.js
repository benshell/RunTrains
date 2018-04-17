import WebSocket from 'ws'
import axios from 'axios'
import store from './store'
import { MOCK_JMRI, JMRI_HOST, JMRI_PORT, JMRI_HEARTBEAT_INTERVAL, DEBUGGING } from './constants'
import { updateTrain } from './actions'
import { syncRoster } from './actions/roster'
import rosterData from '../tests/data/roster'
import pubsub from './pubsub'

const JMRI_WS_API = `ws://${JMRI_HOST}:${JMRI_PORT}/json/`
const JMRI_JSON_API = `http://${JMRI_HOST}:${JMRI_PORT}/json/`

let ws
let wsReady = false
let pingTimer = 0
let sendTimer = 0
let pendingSends = []

const jmri = {}

if (MOCK_JMRI) {
  jmri.init = () => {
    store.dispatch(syncRoster(rosterData))
  }

  jmri.send = () => {}
} else {
  jmri.init = () => {
    if (ws) ws.terminate()
    ws = new WebSocket(JMRI_WS_API)

    ws.on('error', err => {
      wsReady = false
      console.error('JMRI connection error:', JMRI_WS_API)
      setTimeout(() => {
        jmri.init()
      }, JMRI_HEARTBEAT_INTERVAL)
    })

    ws.on('open', function open() {
      wsReady = true

      jmri.loadRoster()

      // TODO: Set the interval from the initial data received from JMRI
      if (pingTimer) clearInterval(pingTimer)
      pingTimer = setInterval(() => {
        if (wsReady) jmri.send('{"type": "ping"}')
      }, JMRI_HEARTBEAT_INTERVAL)

      // Sync current throttles back to JMRI in case the connection to JMRI was lost.
      // TODO: Figure out if these timeouts are necessary
      const trains = store.getState().trains
      trains.forEach((t, i) => {
        t.addresses.forEach((address, j) => {
          setTimeout(() => {
            jmri.send(
              JSON.stringify({
                type: 'throttle',
                data: { throttle: String(address), address },
              }),
            )
          }, JMRI_HEARTBEAT_INTERVAL + i * 500 + j * 500)
        })
      })

      // Try (continually) to process any pending sends
      if (sendTimer) clearInterval(sendTimer)
      sendTimer = setInterval(() => {
        if (wsReady) {
          const data = pendingSends.shift()
          if (data) {
            console.log('Re-sending data...')
            jmri.send(data)
          }
        }
      }, 1000)
    })

    ws.on('message', function incoming(message) {
      const { type, data } = JSON.parse(message)
      if (!type) return
      if (DEBUGGING) console.log('JMRI receive:', message)
      switch (type) {
        case 'throttle':
          const { throttle, speed, forward, speedSteps, clients, ...functionUpdates } = data
          const address = parseInt(throttle, 10)
          const trains = store.getState().trains
          const speedChange =
            typeof speed !== 'undefined'
              ? {
                  speed,
                }
              : {}
          const dirChange =
            typeof forward !== 'undefined'
              ? {
                  forward,
                }
              : {}
          trains.filter(train => train.addresses.indexOf(address) > -1).forEach(train => {
            store.dispatch(
              updateTrain({
                id: train.id,
                source: 'jmri',
                ...speedChange,
                ...dirChange,
                functionUpdates,
              }),
            )
          })
          break
      }
    })
  }

  jmri.send = data => {
    if (!wsReady) {
      console.log('JMRI not ready for send!')
      pendingSends.push(data)
      return
    }
    if (DEBUGGING) console.log('JMRI send: ', data)
    ws.send(data, error => {
      if (error) {
        console.log('JMRI send error!', error)
        wsReady = false
        setTimeout(() => {
          jmri.init()
        }, 3000)
      }
    })
  }

  jmri.loadRoster = () => {
    axios
      .get(JMRI_JSON_API + 'roster')
      .then(response => {
        const { data } = response
        store.dispatch(syncRoster({ source: 'jmri', ...data }))
      })
      .catch(function(error) {
        console.log(error)
      })
  }
}

pubsub.subscribe('trainAdded', ({ trainAdded: train }) => {
  train.addresses.forEach(address => {
    jmri.send(
      JSON.stringify({
        type: 'throttle',
        data: { throttle: String(address), address },
      }),
    )
  })
})

pubsub.subscribe('trainUpdated', data => {
  const { trainUpdated: train } = data
  const { source, functions, ...changes } = data.changes || {}
  if (train.source === 'jmri') return
  const fnChanges = (functions || []).reduce((acc, val) => ({ ...acc, [val.name]: val.value }), {})
  let dirChanges = {}
  train.addresses.forEach((address, index) => {
    dirChanges = changes.hasOwnProperty('speed')
      ? { forward: train.orientations[index] === train.forward }
      : {}
    jmri.send(
      JSON.stringify({
        type: 'throttle',
        data: {
          throttle: String(address),
          ...changes,
          ...dirChanges,
          ...fnChanges,
        },
      }),
    )
  })
})

pubsub.subscribe('trainRemoved', ({ trainRemoved: train }) => {
  train.addresses.forEach(address => {
    jmri.send(
      JSON.stringify({
        type: 'throttle',
        data: {
          throttle: String(address),
          speed: 0,
        },
      }),
    )
    jmri.send(
      JSON.stringify({
        type: 'throttle',
        data: { throttle: String(address), release: null },
      }),
    )
  })
})

export default jmri
