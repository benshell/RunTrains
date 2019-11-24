const net = require('net')
const { getTrainsByAddress } = require('./helpers')
const {
  hex2bin,
  dec2bin,
  hex2dec,
  bin2dec,
  bin2hex,
  dec2hex,
} = require('./convert')
const { updateTrain } = require('./actions/trains')
const { syncRoster } = require('./actions/roster')
const pubsub = require('./pubsub')
const {
  DEBUGGING,
  CBUS_HOST,
  CBUS_PORT,
  SYNC_THROTTLES,
} = require('./constants')

// CAN_ID values in the range 100 to 127 have been reserved (so far) for modules
// with fixed CAN_IDs such as the PC interfaces and DCC command station which
// have no DIL switches. JMRI is configurable from 120 to 127. (Default for CAN
// network interface is 127.)
const CAN_ID = 119
const CMD_INIT_SESSION = 40
const HEARTBEAT_INTERVAL = 3500
const MAX_SESSIONS = 9 // TODO, how many sessions can we have?

const sessions = {} // MERG CANCMD session -> address
const pending = {} // address -> session attempted
const cbus = {}
let client

function getSessions() {
  return Object.keys(sessions).map(session => ({
    session,
    address: sessions[session],
  }))
}

function getSessionByAddress(address) {
  return (
    Object.keys(sessions).find(
      session => sessions[session] === parseInt(address),
    ) || -1
  )
}

function inSession(address) {
  return Object.values(sessions).indexOf(parseInt(address)) > -1
}

function getSession(session) {
  return sessions[parseInt(session)]
}

function hasSession(session, address) {
  return getSession(session) === parseInt(address)
}

function setSession(session, address) {
  sessions[parseInt(session)] = parseInt(address)
}

function removeSession(session) {
  sessions[parseInt(session)] = -1
}

function parseThrottle(hexMessage) {
  const binMsg = hex2bin(hexMessage)
  return {
    isLong: binMsg.substr(0, 2) === '11',
    address: bin2dec(binMsg.substr(2)),
  }
}

function formatAddressHex(address) {
  let addrBin = dec2bin(address, 2)
  if (address > 127) {
    addrBin = '11' + addrBin.substr(2) // make upper bits 11
  }
  return bin2hex(addrBin)
}

cbus.init = () => {
  if (SYNC_THROTTLES !== 'cbus') return

  client = new net.Socket()

  client.connect(CBUS_PORT, CBUS_HOST, () => {
    console.log('Connected to CBUS server')

    setInterval(() => {
      getSessions().forEach(({ session, address }) => {
        // Is this one of our sessions?
        if (getTrainsByAddress(address).length) {
          // console.log('Keep alive session:', session)
          cbus.send(['23', dec2hex(session)])
        }
      })
    }, HEARTBEAT_INTERVAL)
  })

  client.on('data', data => {
    const frames = data.toString('binary')
    frames.split(';').forEach(cbus.handleData)
  })

  client.on('close', () => {
    console.error('CBUS server connection closed')
    cbus.init()
  })
}

cbus.handleData = frame => {
  data = cbus.parseFrame(frame)
  if (!data) return

  const { command, message } = data
  const bytes = cbus.splitBytes(message)

  let session = ''
  let address = ''
  let throttle = ''
  let speed = ''

  switch (command) {
    case '21':
      console.log('Release session:', hex2dec(message))
      break

    // Query engine session
    case '22':
      console.log('Query session:', data)
      break

    // Ignore keep alive messages
    case '23':
      break

    case CMD_INIT_SESSION:
      address = parseThrottle(message).address
      console.log('Initialize throttle:', address)
      break

    case '47':
      session = bytes[0]
      speed = hex2dec(bytes[1])
      console.log('session:', session, 'throttle change:', speed)
      break

    case '63':
      /*
      DCC Error codes:
      These codes are returned by OPC  ERR 0x63 
      1 Loco stack full    First two bytes are loco address, third is error number. 
      2 Loco address taken  - First two byes are loco address, third is error number. 
      3 Session not present   - First byte session id, second byte zero, third is error number. 
      4 Consist empty  - First byte consist id, second byte zero, third is error number. 
      5 Loco not found - First byte session id, second byte zero,, third is error number. 
      6 CAN bus error  - Two data bytes set to zero (not used), third is error number. 
      - This would be sent out in the unlikely event that the command station buffers overflow. 
      7 Invalid request  - First two bytes are loco address, third is error number.   
      - Indicates an invalid or inconsistent request. For example, a GLOC request with both steal and share flags set. 
      8 Session cancelled - First byte session id, second byte zero, third is error number. 
      - Sent to a cab to cancel the session when another cab is stealing that session. 
      */
      const error = hex2dec(bytes[2]) // third byte is error number
      // Stack is full
      if (error === '1') {
        address = parseThrottle(bytes[0] + bytes[1]).address
        console.log('Error getting throttle, stack is full', address)
        cbus.acquireThrottle(address, true)
      } else if (error === '2') {
        address = parseThrottle(bytes[0] + bytes[1]).address
        console.log('Error getting throttle, loco address is taken', address)
        cbus.acquireThrottle(address, true)
      } else {
        // TODO: Fill in error from docs above
        console.log('Unknown CBUS DCC error: ', data)
      }
      break
    case 'E1':
      // <Session><AddrH><AddrL><Speed/Dir><Fn1><Fn2><Fn3>
      session = hex2dec(bytes[0])
      address = parseThrottle(bytes[1] + bytes[2]).address
      speed = hex2dec(bytes[3])
      console.log(
        'Got throttle session:',
        session,
        'address:',
        address,
        'speed:',
        speed,
        'functions:',
        bytes.slice(4),
      )
      // See if there's already a session for this address
      if (hasSession(session, address)) {
        console.warn(
          'We are already tracking session',
          session,
          'with address',
          address,
        )
      } else {
        setSession(session, address)
      }
      pending[address] = -1
      break
    default:
      console.log('Unknown CBUS message', data)
  }
}

cbus.acquireThrottle = (address, force = false) => {
  if (inSession(address)) {
    console.warn(
      'We already have a session open for this locomotive:',
      address,
      sessions,
    )
  } else {
    // TODO: Fire an action to change the train records to show this address as pending
    // (Just in case the address was previously ready, but needs to be re-acquired.)

    // GLOC:
    // const flags = '00000010'
    // cbus.send([61, formatAddressHex(address), bin2hex(flags)])

    // RLOC:
    if (!force) {
      cbus.send([CMD_INIT_SESSION, formatAddressHex(address)])
    } else {
      // Replace any session we aren't tracking
      pending[address] =
        typeof pending[address] === 'number' ? pending[address] + 1 : 0
      if (pending[address] > MAX_SESSIONS) return
      if (!getSession(pending[address])) {
        cbus.send([21, dec2hex(pending[address])])
        // Wait, and then try to aquire the throttle.
        // If it errors, acquireThrottle will be called again and it will try with the next session
        setTimeout(() => {
          cbus.send([CMD_INIT_SESSION, formatAddressHex(address)])
        }, 2000)
      }
    }
  }
}

cbus.clearAllSessions = (session = 0) => {
  const numQuery = MAX_SESSIONS
  if (session < numQuery) {
    setTimeout(() => {
      cbus.send([21, dec2hex(session)])
      cbus.clearAllSessions(session + 1)
    }, 2000)
  }
}

// cbus.querySessions = (session = 0) => {
//   const numQuery = 9
//   if (session < numQuery) {
//     setTimeout(() => {
//       cbus.send([22, dec2hex(session)])
//       cbus.querySessions(session + 1)
//     }, 5000)
//   }
// }

// cbus.systemReset = () => {
//   cbus.send(['07'])
// }

/**
 * Frame format:
 * : Start of the frame
 * S or X: Standard or Extended Frame
 * (4) Characters: Header in hex (priority + CAN ID + 00000 for padding, as CAN uses 11 bits)
 * N or R: signifying a Normal or a RTR frame (RTR is Remote Transfer
 * Request). Except during the self enumeration process, CBUS only uses Normal frames.
 * (2) Characters: OpCode... the command, plus the number of bytes to follow, if any
 * Hex characters: Message
 * ; End of the frame
 */
cbus.parseFrame = frame => {
  if (!frame) return
  const match = frame.match(
    /^\:(S|X)([A-Z0-9]{4})(N|R)([A-Z0-9]{2})([A-Z0-9]*)\;?$/,
  )
  if (!match) {
    console.warn('Unable to parse CBUS frame: ', frame)
    return
  }
  if (match[1] === 'X') {
    console.warn('Unable to handle CBUS extended frame: ', frame)
  }
  if (match[3] === 'R') {
    console.warn('Unable to handle CBUS RTR frame: ', frame)
  }
  const header = hex2bin(match[2], 2)
  const priority = header.substr(0, 4)
  const canId = bin2dec(header.substr(4, 7))
  const opCode = hex2bin(match[4], 1)
  const numBytes = bin2dec(opCode.substr(0, 3))
  // technically the command is the second part of the opCode, but the MERG dev guide
  // gives command examples in the raw HEX so that's what we'll use here
  // const command = bin2dec(opCode.substr(3))
  const command = match[4]
  const message = match[5]
  return {
    frame,
    priority,
    canId,
    numBytes,
    command,
    message,
  }
}

cbus.splitBytes = hexMessage => {
  return hexMessage.split('').reduce((acc, val) => {
    if (acc[acc.length - 1] && acc[acc.length - 1].length === 1) {
      acc[acc.length - 1] += val
    } else {
      acc.push(val)
    }
    return acc
  }, [])
}

cbus.send = bytes => {
  /*
  const header = hex2bin(match[2], 2)
  const priority = header.substr(0, 4)
  const canId = bin2dec(header.substr(4, 7))
  const opCode = hex2bin(match[4], 1)
  const numBytes = bin2dec(opCode.substr(0, 3))
  // technically the command is the second part of the opCode, but the MERG dev guide
  // gives command examples in the raw HEX so that's what we'll use here
  // const command = bin2dec(opCode.substr(3))
  */
  // header is 11 bits, but 2 bytes (padding) via the PC
  const priority = '0000'
  const header = (priority + dec2bin(CAN_ID).substr(1)).padEnd(16, '0')
  // console.log('send header: ', header, header.length, bin2hex(header))
  const frame = [':S', bin2hex(header, 2), 'N', ...bytes, ';'].join('')
  const validateFrame = cbus.parseFrame(frame)
  if (validateFrame) {
    console.log('CBUS send frame', validateFrame)
    const buffer = Buffer.from(frame)
    client.write(buffer)
  } else {
    console.warn('Invalid CBUS frame', frame)
  }
}

pubsub.subscribe('trainAdded', ({ trainAdded: train }) => {
  if (SYNC_THROTTLES !== 'cbus') return
  train.addresses.forEach(address => {
    cbus.acquireThrottle(address)
  })
})

pubsub.subscribe('trainUpdated', data => {
  if (SYNC_THROTTLES !== 'cbus') return
  const { trainUpdated: train } = data
  const { source, functions, ...changes } = data.changes || {}
  if (train.source === 'jmri') return

  // Check for CBUS sessions for each address in the train
  const sessions = train.addresses.map(address => getSessionByAddress(address))

  // If there are any invalid sessions, deal with that first
  sessions.forEach((session, index) => {
    if (session === -1) {
      const address = train.addresses[index]
      cbus.acquireThrottle(address)
    }
  })

  // Now exit if there are any invalid sessions
  if (sessions.find(session => session === -1)) return

  // Handle train speed/direction changes
  if (
    typeof changes['speed'] !== 'undefined' ||
    typeof changes['forward'] !== 'undefined'
  ) {
    train.addresses.forEach((address, index) => {
      const session = getSessionByAddress(address)
      if (session > -1) {
        const isForward = train.orientations[index]
          ? train.forward
          : !train.forward
        let speedBin = dec2bin((changes['speed'] || 0) * 127)
        // set forward direction bit
        if (isForward) {
          speedBin = '1' + speedBin.substr(1)
        }
        cbus.send([47, dec2hex(session), bin2hex(speedBin)])
      }
    })
  }

  // Handle function changes
  const fnChanges = (functions || []).reduce(
    (acc, val) => ({ ...acc, [val.name]: val.value }),
    {},
  )
  // function byte ranges:
  // 1 = F0 to F4
  // 2 = F5 to F8
  // 3 = F9 to F12
  // 4 = F13 to F19
  // 5 = F20 to F28
  const fnRanges = Object.keys(fnChanges)
    // extract just the number (e.g. 4 from "F4")
    .map(fNum => parseInt(fNum.substr(1)))
    // divide into range(s) we need to send for this change
    .reduce((acc, val) => {
      if (val <= 4) acc[1] = [0, 4]
      else if (val <= 8) acc[2] = [5, 8]
      else if (val <= 12) acc[3] = [9, 12]
      else if (val <= 19) acc[4] = [13, 19]
      else if (val <= 28) acc[5] = [20, 28]
      return acc
    }, {})
  // create the function byte for each updated fn range
  const fnUpdates = Object.keys(fnRanges).map(range => {
    const [start, end] = fnRanges[range]
    return [
      // the function range above, e.g. 1 for F0 to F4
      range,
      // Start by building an array of binary values for the function values in this range
      // e.g.: [ 0, 2, 4, 0, 0 ] means F1 (bell) on and F2 (whistle) on.
      // and then bitwise OR to convert to a single DCC function byte,
      // e.g.: 00000110 (the second and third bits, F1 and F2, have a value of one)
      train.functions
        .map(fn => ({ ...fn, num: parseInt(fn.name.substr(1)) }))
        .filter(fn => fn.num >= start && fn.num <= end)
        .map(fn => {
          const bitVal = fn.value ? 0b1 : 0b0
          // range F0-F4 is out of order... bits are F1, ..., F4, F0
          if (range === '1') {
            if (fn.num === 0) return bitVal << 4
            return bitVal << (fn.num - 1)
          } else {
            return bitVal << (fn.num - start)
          }
        })
        .reduce((acc, val) => acc | val, ''),
    ]
  })

  // Ready to send function updates to each address in the train
  if (fnUpdates.length) {
    train.addresses.forEach((address, index) => {
      const session = getSessionByAddress(address)
      if (session > -1) {
        fnUpdates.forEach(([fnRange, fnState]) => {
          cbus.send([60, dec2hex(session), dec2hex(fnRange), dec2hex(fnState)])
        })
      }
    })
  }
})

pubsub.subscribe('trainRemoved', ({ trainRemoved: train }) => {
  train.addresses.forEach(address => {
    // TODO: Stop the train first
    // Actually, this should probably be done elsewhere, before this event is fired
    const session = getSessionByAddress(address)
    removeSession(session)

    // TODO: Send the release command to MERG?
  })
})

module.exports = cbus
