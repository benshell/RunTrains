# **RunTrains**: A Web Based DCC Train Control System

## RunTrains Server

This is the Node.js/Express based server, typically running on the same
computer or LAN as JMRI, which connects with JMRI through the JMRI JSON API.

## Configuration

Defaults are configured in `src/constants.js` and can be overridden using
environment variables:

* PORT = 8000
* MOCK_JMRI = false // useful when testing without JMRI available
* JMRI_HOST = 'localhost'
* JMRI_PORT = 12080
* JMRI_HEARTBEAT_INTERVAL = 10000
* CLIENT_URLS = 'http://localhost:3000,http://localhost:8000' // for CORS
* DEBUGGING = false // adds additional console logging

## See also the README in the root folder: `../README.md`
