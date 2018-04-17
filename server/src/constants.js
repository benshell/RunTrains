export const PORT = process.env.PORT || 8000
export const MOCK_JMRI = process.env.MOCK_JMRI || false // useful when testing without JMRI available
export const JMRI_HOST = process.env.JMRI_HOST || 'localhost'
export const JMRI_PORT = process.env.JMRI_PORT || '12080'
export const JMRI_HEARTBEAT_INTERVAL = process.env.JMRI_HEARTBEAT_INTERVAL || 10000
export const CLIENT_URLS = process.env.CLIENT_URLS || 'http://localhost:3000,http://localhost:8000' // for CORS
export const DEBUGGING = process.env.DEBUGGING || false
