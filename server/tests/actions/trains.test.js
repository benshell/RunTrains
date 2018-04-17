import test from 'tape'
import * as actions from '../../src/actions/trains'
import * as types from '../../src/actions/types'

test('Action: Add train', assert => {
  const address = 3
  const expectedAction = {
    type: types.ADD_TRAIN,
    name: 'My train',
    addresses: [3, 4],
    orientations: [true, false],
  }
  const actionResult = actions.addTrain({
    name: 'My train',
    addresses: [3, 4],
    orientations: [true, false],
  })
  assert.ok(actionResult.id.match(/^[\w]{8}-([\w]{4}-){3}[\w]{12}$/), 'generates a UUID')
  assert.deepEqual(actionResult, { id: actionResult.id, ...expectedAction })
  assert.end()
})

test('Action: Update train', assert => {
  const expectedAction = {
    type: types.UPDATE_TRAIN,
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    speed: 0.5,
  }

  const actionResult = actions.updateTrain({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    speed: 0.5,
  })

  assert.deepEqual(actionResult, expectedAction)
  assert.end()
})

test('Action: Remove train', assert => {
  const expectedAction = {
    type: types.REMOVE_TRAIN,
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  }
  assert.deepEqual(actions.removeTrain('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), expectedAction)
  assert.end()
})
