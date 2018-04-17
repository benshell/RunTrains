import test from 'tape'
import * as actions from '../../src/actions/roster'
import * as types from '../../src/actions/types'
import roster from '../data/roster'

test('Action: Sync roster (from JMRI)', assert => {
  const actionResult = actions.syncRoster(roster)
  assert.equal(actionResult.type, types.SYNC_ROSTER)
  assert.equal(actionResult.roster.length, 3)
  assert.deepEqual(actionResult.roster[2], {
    name: 'UP Big Boy 4000',
    address: 4000,
    functions: [
      { name: 'F0', label: 'Lights', lockable: true },
      { name: 'F1', label: 'Whistle', lockable: false },
      { name: 'F2', label: 'Bell', lockable: true },
    ],
  })
  assert.end()
})
