import * as types from './types'
import uuid from 'uuid'

/**
 * Action creators
 */
export function addTrain(args) {
  return {
    type: types.ADD_TRAIN,
    id: uuid(),
    name: args.name,
    addresses: args.addresses,
    orientations: args.orientations,
  }
}

export function updateTrain(args) {
  return {
    type: types.UPDATE_TRAIN,
    ...args,
  }
}

export function removeTrain(id) {
  return {
    type: types.REMOVE_TRAIN,
    id: id,
  }
}
