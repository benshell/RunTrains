const PORT = process.env.PORT || 8000
const MOCK_JMRI = process.env.MOCK_JMRI || false // useful when testing without JMRI available
const JMRI_HOST = process.env.JMRI_HOST || 'localhost'
const JMRI_PORT = process.env.JMRI_PORT || '12080'
const JMRI_HEARTBEAT_INTERVAL = process.env.JMRI_HEARTBEAT_INTERVAL || 10000
const CLIENT_URLS =
  process.env.CLIENT_URLS || 'http://localhost:3000,http://localhost:8000' // for CORS
const DEBUGGING = process.env.DEBUGGING || false

module.exports = {
  PORT,
  MOCK_JMRI,
  JMRI_HOST,
  JMRI_PORT,
  JMRI_HEARTBEAT_INTERVAL,
  CLIENT_URLS,
  DEBUGGING,
}
