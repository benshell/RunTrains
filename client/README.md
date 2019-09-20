# **RunTrains**: A Web Based DCC Train Control System

## RunTrains Client

This is the throttle app for running trains, which is built with React
(JavaScript) and able to run either in the browser or as a Progressive Web App.
When running as a PWA (supported by Android and iOS 11.3+) you can add this app
to your home screen and use it like any other app, even when you are offline
(assuming you are connecting to a server that is still online).

## Configuration

Defaults are configured in `src/constants.js` and can be overridden using
environment variables:

- REACT_APP_SERVER_HOST = 'localhost'
- REACT_APP_SERVER_PORT = 8000
- REACT_APP_SERVER_SSL = false

The `REACT_APP_` prefixes are a security feature of `create-react-app`.
Also, as part of the `create-react-app` framework, the default development port
can also be overridden with enivornment variables:

- PORT = 3000

## Docker (optional)

From the current directory:

```
docker build -t runtrains-client .
```

Be sure to build the server too.
Then from one directory level up, run

```
docker-compose up
```

## See also the README in the root folder: `../README.md`
