import React from 'react'

import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'

import ThrottleControls from '../ThrottleControls'

const data = {
  id: 1,
  speed: 0,
  forward: false,
  functions: [
    { name: 'F0', label: 'Lights', value: false, lockable: true },
    { name: 'F1', label: 'Whistle', value: false, lockable: false },
    { name: 'F2', label: 'Bell', value: false, lockable: true },
  ],
}

storiesOf('Throttle', module).add('neutral / reverse', () => (
  <ThrottleControls data={data} onChange={action()} height={400} />
))

storiesOf('Throttle', module).add('neutral / forward', () => (
  <ThrottleControls data={{ ...data, forward: true }} onChange={action()} height={400} />
))

storiesOf('Throttle', module).add('half speed', () => (
  <ThrottleControls data={{ ...data, speed: 0.5 }} onChange={action()} height={400} />
))

storiesOf('Throttle', module).add('full throttle', () => (
  <ThrottleControls data={{ ...data, speed: 1 }} onChange={action()} height={400} />
))
