const WebSocket = require('ws')
const axios = require('axios')
const store = require('./store')
const {
  MOCK_JMRI,
  JMRI_HOST,
  JMRI_PORT,
  JMRI_HEARTBEAT_INTERVAL,
  DEBUGGING,
  SYNC_ROSTER,
  SYNC_THROTTLES,
} = require('./constants')
const { updateTrain } = require('./actions/trains')
const { syncRoster } = require('./actions/roster')
const rosterData = require('../tests/data/roster')
const pubsub = require('./pubsub')

const JMRI_WS_API = `ws://${JMRI_HOST}:${JMRI_PORT}/json/`
const JMRI_JSON_API = `http://${JMRI_HOST}:${JMRI_PORT}/json/`

let ws
let wsReady = false
let rateLimit = 100 // min time before JMRI additional messages
let isRateLimited = false
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
    // Initialize loading the roster
    if (SYNC_ROSTER === 'jmri') jmri.loadRoster()

    // Everything below relates to websockets, which are only needed for syncing throttles
    if (SYNC_THROTTLES !== 'jmri') return

    console.info('Initializing JMRI connection', JMRI_WS_API)
    if (ws) ws.terminate()
    ws = new WebSocket(JMRI_WS_API)

    ws.on('error', err => {
      wsReady = false
      console.error(
        'JMRI connection error',
        JMRI_WS_API,
        err,
        'resetting connection in',
        JMRI_HEARTBEAT_INTERVAL,
      )
      setTimeout(() => {
        jmri.init()
      }, JMRI_HEARTBEAT_INTERVAL)
    })

    ws.on('open', function open() {
      console.log('JMRI connection open')
      wsReady = true

      // TODO: Set the interval from the initial data received from JMRI
      if (pingTimer) clearInterval(pingTimer)
      pingTimer = setInterval(() => {
        if (wsReady) jmri.queue({ type: 'ping' })
      }, JMRI_HEARTBEAT_INTERVAL)

      // Sync current throttles back to JMRI in case the connection to JMRI was lost.
      // These timeouts seem to be necessary anytime we are requesting a throttle.
      const trains = store.getState().trains
      trains.forEach((t, i) => {
        t.addresses.forEach((address, j) => {
          setTimeout(() => {
            if (DEBUGGING)
              console.log('Re-initializing throttle after JMRI init', address)
            jmri.queue({
              type: 'throttle',
              data: { throttle: String(address), address },
            })
          }, JMRI_HEARTBEAT_INTERVAL + i * 500 + j * 500)
        })
      })

      // Try (continually) to process any pending sends
      if (sendTimer) clearInterval(sendTimer)
      sendTimer = setInterval(() => {
        if (!wsReady) return
        const data = pendingSends.shift()
        if (!data) return
        console.log('Sending pending data', data)
        jmri.send(data)
      }, 500)
    })

    ws.on('message', function incoming(message) {
      const { type, data } = JSON.parse(message)
      if (!type) return
      // if (DEBUGGING) console.log('JMRI WS receive:', message)
      switch (type) {
        case 'throttle':
          const {
            throttle,
            speed,
            forward,
            speedSteps,
            clients,
            ...functionUpdates
          } = data
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
          trains
            .filter(train => train.addresses.indexOf(address) > -1)
            .forEach(train => {
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

  jmri.queue = data => {
    if (!wsReady) {
      if (DEBUGGING)
        console.log('JMRI not ready for send! Adding to pending:', data)
      pendingSends.push(data)
      return
    }

    jmri.send(data)
  }

  jmri.send = data => {
    if (!data.method) data = { ...data, method: 'get' }
    if (DEBUGGING) console.log('JMRI WS send: ', data)
    const json = JSON.stringify(data)
    ws.send(json, error => {
      if (error) {
        console.error('Critical JMRI send error! Re-initializing...', error)
        wsReady = false
        setTimeout(() => {
          jmri.init()
        }, 3000)
      }
    })
  }

  jmri.loadRoster = () => {
    if (SYNC_ROSTER !== 'jmri') return
    axios
      .get(JMRI_JSON_API + 'roster')
      .then(response => {
        const { data } = response
        console.log(`Loaded roster with ${data.length} entries`)
        store.dispatch(syncRoster({ source: 'jmri', ...data }))
      })
      .catch(function(error) {
        console.error('Error loading JMRI roster', error)
        setTimeout(jmri.loadRoster, 10000)
      })
  }
}

pubsub.subscribe('trainAdded', ({ trainAdded: train }) => {
  if (SYNC_THROTTLES !== 'jmri') return
  train.addresses.forEach(address => {
    jmri.queue({
      type: 'throttle',
      data: { throttle: String(address), address },
    })
  })
})

pubsub.subscribe('trainUpdated', data => {
  if (SYNC_THROTTLES !== 'jmri') return
  const { trainUpdated: train } = data
  const { source, functions, ...changes } = data.changes || {}
  if (DEBUGGING)
    console.log('JMRI handling trainUpdated', JSON.stringify(changes))
  if (train.source === 'jmri') return
  const fnChanges = (functions || []).reduce(
    (acc, val) => ({ ...acc, [val.name]: val.value }),
    {},
  )
  let dirChanges = {}
  train.addresses.forEach((address, index) => {
    dirChanges = changes.hasOwnProperty('speed')
      ? { forward: train.orientations[index] === train.forward }
      : {}
    jmri.queue({
      type: 'throttle',
      data: {
        throttle: String(address),
        ...changes,
        ...dirChanges,
        ...fnChanges,
      },
    })
  })
})

pubsub.subscribe('trainRemoved', ({ trainRemoved: train }) => {
  if (SYNC_THROTTLES !== 'jmri') return
  train.addresses.forEach(address => {
    // Stop the train first
    jmri.queue({
      type: 'throttle',
      data: {
        throttle: String(address),
        speed: 0,
      },
    })
    // It might not be necessary, or a good idea, to ever release a locomotive. If RunTrains is
    // acting as the hub of operations, just removing a train from internal memory should be
    // enough.
    // jmri.queue({
    //   type: 'throttle',
    //   data: { throttle: String(address), release: null },
    // })
  })
})

pubsub.subscribe('updateRoster', () => {
  jmri.loadRoster()
})

module.exports = jmri
