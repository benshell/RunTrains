const types = require('./types')
const uuid = require('uuid')

/**
 * Action creators
 */
function addTrain(args) {
  return {
    type: types.ADD_TRAIN,
    id: uuid(),
    name: args.name,
    addresses: args.addresses,
    orientations: args.orientations,
  }
}

function updateTrain(args) {
  return {
    type: types.UPDATE_TRAIN,
    ...args,
  }
}

function removeTrain(id) {
  return {
    type: types.REMOVE_TRAIN,
    id: id,
  }
}

module.exports = { addTrain, updateTrain, removeTrain }
