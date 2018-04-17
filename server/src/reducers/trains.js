import produce from 'immer'
import * as types from '../actions/types'

export default (state = [], action) => {
  const { type, ...train } = action
  let existing
  return produce(state, draft => {
    switch (type) {
      case types.ADD_TRAIN:
        existing = draft.findIndex(t => t.name === train.name)
        if (existing === -1) {
          const newTrain = {
            addresses: [],
            orientations: [],
            speed: 0,
            forward: true,
            functions: [...Array(29)].map((v, i) => ({ name: `F${i}`, value: false })),
            ...train,
          }
          draft.push(newTrain)
        }
        break
      case types.UPDATE_TRAIN:
        existing = draft.findIndex(t => t.id === train.id)
        if (existing > -1) {
          const { functionUpdates, ...updates } = train
          if (functionUpdates) {
            const functions = draft[existing].functions.map(f => {
              if (typeof functionUpdates[f.name] === 'undefined') return f
              return { ...f, value: functionUpdates[f.name] }
            })
            draft[existing] = { ...draft[existing], ...updates, functions }
          } else {
            draft[existing] = { ...draft[existing], ...updates }
          }
        }
        break
      case types.REMOVE_TRAIN:
        return draft.filter(t => t.id !== train.id)
        break
    }
  })
}
