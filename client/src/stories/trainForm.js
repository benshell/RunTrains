import React from 'react'

import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'

import TrainForm from '../TrainForm'

const roster = [
  {
    name: 'UP 1982',
    address: 1982,
  },
  {
    name: 'UP 1988',
    address: 1988,
  },
]
const train = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  name: 'UP Heritage Units',
  addresses: [1982, 1988],
  orientations: [true, false],
}

storiesOf('Train Add & Edit Form', module).add('empty form', () => <TrainForm roster={[]} />)
storiesOf('Train Add & Edit Form', module).add('with roster', () => <TrainForm roster={roster} />)
storiesOf('Train Add & Edit Form', module).add('with initial train', () => (
  <TrainForm roster={roster} initialTrain={train} />
))
