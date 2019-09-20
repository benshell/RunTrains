if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv')
  dotenv.config()
}

const PORT = process.env.PORT || 8000
const MOCK_JMRI = process.env.MOCK_JMRI || false // useful when testing without JMRI available
const JMRI_HOST = process.env.JMRI_HOST || 'localhost'
const JMRI_PORT = process.env.JMRI_PORT || '12080'
const JMRI_HEARTBEAT_INTERVAL = process.env.JMRI_HEARTBEAT_INTERVAL || 10000
const CBUS_HOST = process.env.CBUS_HOST || 'localhost'
const CBUS_PORT = process.env.CBUS_PORT || '5550'
const CLIENT_URLS =
  process.env.CLIENT_URLS || 'http://localhost:3000,http://localhost:8000' // for CORS
const DEBUGGING = process.env.DEBUGGING || false
const SYNC_ROSTER = 'jmri'
const SYNC_THROTTLES = 'cbus' // or 'jmri'

module.exports = {
  PORT,
  MOCK_JMRI,
  JMRI_HOST,
  JMRI_PORT,
  CBUS_HOST,
  CBUS_PORT,
  JMRI_HEARTBEAT_INTERVAL,
  CLIENT_URLS,
  DEBUGGING,
  SYNC_ROSTER,
  SYNC_THROTTLES,
}
