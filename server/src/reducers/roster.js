import * as types from '../actions/types'

export default (state = [], action) => {
  const { type, ...data } = action
  switch (type) {
    case types.SYNC_ROSTER:
      return data.roster
    default:
      return state
  }
}
