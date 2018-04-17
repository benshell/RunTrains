import test from 'tape'
import proxyquire from 'proxyquire'
import reducer from '../../src/reducers/trains'
import actions from '../../src/actions/trains'
import * as types from '../../src/actions/types'

test('Train reducer: initial state', assert => {
  assert.deepEqual(reducer(undefined, {}), [])
  assert.end()
})

test('Train reducer: add train', assert => {
  assert.deepEqual(
    reducer([], {
      type: types.ADD_TRAIN,
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      name: 'My train',
      addresses: [3],
      orientations: [true],
    }),
    [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'My train',
        addresses: [3],
        orientations: [true],
        speed: 0,
        forward: true,
        functions: [...Array(29)].map((f, i) => ({ name: `F${i}`, value: false })),
      },
    ],
  )
  assert.end()
})

test('Train reducer: update train speed', assert => {
  assert.deepEqual(
    reducer(
      [
        {
          id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          speed: 0,
        },
      ],
      {
        type: types.UPDATE_TRAIN,
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        speed: 0.5,
      },
    ),
    [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        speed: 0.5,
      },
    ],
  )
  assert.end()
})

test('Train reducer: remove train', assert => {
  assert.deepEqual(
    reducer(
      [
        {
          id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          speed: 0.5,
        },
      ],
      {
        type: types.REMOVE_TRAIN,
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      },
    ),
    [],
  )
  assert.end()
})
