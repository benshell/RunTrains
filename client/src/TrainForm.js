import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import AddIcon from '@material-ui/icons/AddCircle'
import DragIcon from '@material-ui/icons/DragHandle'
import SaveIcon from '@material-ui/icons/Save'
import DeleteIcon from '@material-ui/icons/Delete'
import ForwardIcon from '@material-ui/icons/Forward'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove,
} from 'react-sortable-hoc'

const styles = theme => ({
  form: {
    padding: theme.spacing(2),
  },
  textField: {
    display: 'block',
  },
  formControl: {
    display: 'block',
    marginTop: theme.spacing(3),
    marginBottom: 0,
  },
  buttons: {
    marginTop: theme.spacing(3),
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridGap: '10px',
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
  sortableContainer: {
    paddingTop: theme.spacing(2),
  },
  sortableItem: {
    display: 'flex',
    alignItems: 'center',
    zIndex: 1500,
  },
  dragHandle: {
    margin: '0 10px 0 0',
  },
  addButton: {
    marginLeft: theme.spacing(-2),
  },
  addIcon: {
    marginRight: theme.spacing(1),
  },
  checkReversed: {
    marginLeft: 0,
    marginRight: theme.spacing(-1),
  },
  iconReversed: {
    transform: 'rotate(180deg)',
  },
})

const DragHandle = SortableHandle(({ classes }) => (
  <DragIcon color="action" className={classes.dragHandle} />
))

const SortableItem = SortableElement(
  ({ value, options, classes, handleChange, canDelete }) => {
    return (
      <div className={classes.sortableItem}>
        <DragHandle classes={classes} />
        <Select native value={value.address} onChange={handleChange('address')}>
          {options}
        </Select>
        <FormControlLabel
          className={classes.checkReversed}
          aria-label="Reversed?"
          control={
            <Checkbox
              icon={<ForwardIcon />}
              checkedIcon={<ForwardIcon className={classes.iconReversed} />}
              checked={value.reversed}
              onChange={handleChange('reversed')}
              value="reversed"
            />
          }
        />
        {canDelete ? (
          <IconButton
            className={classes.button}
            aria-label="Delete"
            onClick={handleChange('delete')}
          >
            <DeleteIcon />
          </IconButton>
        ) : null}
      </div>
    )
  },
)

const SortableList = SortableContainer(
  ({ items, classes, handleChange, ...props }) => {
    return (
      <div className={classes.sortableContainer}>
        {items.map((value, index) => (
          <SortableItem
            key={index}
            index={index}
            value={value}
            classes={classes}
            handleChange={handleChange(index)}
            canDelete={items.length > 1}
            {...props}
          />
        ))}
      </div>
    )
  },
)

class TrainForm extends React.PureComponent {
  state = {
    train: {
      name: '',
      addresses: [0],
      orientations: [true],
    },
    confirmDialogOpen: false,
    addressDialogOpen: false,
    addressValue: '',
  }

  componentDidMount() {
    if (!this.props.initialTrain) return
    this.setState({
      train: this.props.initialTrain,
    })
  }

  componentDidUpdate() {
    if (this.addressField) {
      this.addressField.focus()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.initialTrain) return
    this.setState({
      train: nextProps.initialTrain,
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    if (this.props.onSave) this.props.onSave(this.state.train)
  }

  handleChange = name => event => {
    const { train } = this.state
    this.setState({
      train: { ...train, [name]: event.target.value },
    })
  }

  handleChangeLocomotive = index => change => event => {
    const { train } = this.state
    const addresses = [...train.addresses]
    const orientations = [...train.orientations]
    switch (change) {
      case 'address':
        addresses[index] = parseInt(event.target.value, 10)

        if (addresses[index] === -1) {
          this.setState({
            addressDialogOpen: true,
          })
        }

        // Also fill in the train name, if blank or matching previous
        const { name: prevName } =
          this.props.roster.find(r => r.address === train.addresses[index]) ||
          {}
        const { name: thisName } =
          this.props.roster.find(r => r.address === addresses[index]) || {}
        const name =
          !train.name || train.name === prevName ? thisName || '' : train.name

        this.setState({
          train: { ...train, name, addresses },
        })
        break
      case 'reversed':
        orientations[index] = !orientations[index]
        this.setState({
          train: { ...train, orientations },
        })
        break
      case 'delete':
        addresses.splice(index, 1)
        orientations.splice(index, 1)
        this.setState({
          train: { ...train, addresses, orientations },
        })
        break
      default:
      // Nothing to do
    }
  }

  handleAddLocomotive = event => {
    const { train } = this.state
    this.setState({
      train: {
        ...train,
        addresses: train.addresses.concat([0]),
        orientations: train.orientations.concat([true]),
      },
    })
  }

  handleSortLocomotive = ({ oldIndex, newIndex }, event) => {
    const { train } = this.state
    this.setState({
      train: {
        ...train,
        addresses: arrayMove(train.addresses, oldIndex, newIndex),
        orientations: arrayMove(train.orientations, oldIndex, newIndex),
      },
    })
  }

  handleRemove = event => {
    this.setState({
      confirmDialogOpen: true,
    })
  }

  handleDialogClose = event => {
    this.setState({
      confirmDialogOpen: false,
      addressDialogOpen: false,
    })
  }

  handleRemoveConfirm = event => {
    this.setState({
      confirmDialogOpen: false,
    })
    if (this.props.onRemove) this.props.onRemove()
  }

  handleAddressChange = event => {
    this.setState({
      addressValue: event.target.value,
    })
  }

  handleAddressSubmit = event => {
    if (event) event.preventDefault()
    const { train, addressValue } = this.state
    const address = parseInt(addressValue, 10)

    const addresses = train.addresses.map(addr => {
      if (addr === -1) return address
      return addr
    })

    // Also fill in the train name, if blank or matching previous
    const { name: thisName } =
      this.props.roster.find(r => r.address === address) || {}
    const name = train.name || thisName || `Locomotive #${address}`

    this.setState({
      train: {
        ...train,
        name,
        addresses,
      },
      addressValue: '',
      addressDialogOpen: false,
    })
  }

  render() {
    const { classes, onClose, roster } = this.props
    const { train } = this.state
    const customAddresses = train.addresses
      .filter(address => address > 0)
      .filter(address => !roster.find(r => r.address === address))

    const options = [
      { name: 'Select a locomotive', address: 0 },
      { name: '<Enter DCC address>', address: -1 },
    ]
      .concat(roster.map(r => ({ name: r.name, address: r.address })))
      .concat(
        customAddresses.map(address => ({
          name: `DCC Address: ${address}`,
          address,
        })),
      )
      .map(r => (
        <option key={r.address} value={r.address}>
          {r.name}
        </option>
      ))

    const locomotives = train.addresses.map((address, index) => ({
      address,
      reversed: train.orientations && !train.orientations[index],
    }))

    return (
      <div className={classes.root}>
        <form className={classes.form} onSubmit={this.handleSubmit}>
          <Typography variant="h5">
            {train.id ? 'Edit' : 'Add'} train
          </Typography>

          <FormControl className={classes.formControl} margin="normal">
            <InputLabel>Locomotives</InputLabel>
            <SortableList
              classes={classes}
              options={options}
              items={locomotives}
              onSortEnd={this.handleSortLocomotive}
              handleChange={this.handleChangeLocomotive}
              useDragHandle={true}
            />
            {locomotives.length > 1 ? (
              <FormHelperText>
                Click and drag on the icon to change the order of locomotives.
              </FormHelperText>
            ) : null}
          </FormControl>

          <Button
            className={classes.addButton}
            onClick={this.handleAddLocomotive}
            color="default"
            aria-label="Add locomotive"
          >
            <AddIcon className={classes.addIcon} />
            Add locomotive
          </Button>

          {locomotives.filter(l => l.address > 0).length > 0 ? (
            <TextField
              required
              id="name"
              label="Label"
              className={classes.textField}
              value={train.name}
              onChange={this.handleChange('name')}
              margin="normal"
            />
          ) : null}

          <div className={classes.buttons}>
            <Button
              disabled={!train.name}
              className={classes.button}
              variant="contained"
              color="primary"
              onClick={this.handleSubmit}
            >
              <SaveIcon className={classes.buttonIcon} />
              Save
            </Button>
            {train.id && (
              <Button
                className={classes.button}
                variant="contained"
                color="secondary"
                onClick={this.handleRemove}
              >
                Release
              </Button>
            )}
            <Button
              className={classes.button}
              variant="contained"
              color="inherit"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
        <Dialog
          open={this.state.confirmDialogOpen}
          keepMounted
          onClose={this.handleDialogClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            Are you sure you want to release this train?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              It will be removed for all users.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogClose} color="default">
              Cancel
            </Button>
            <Button onClick={this.handleRemoveConfirm} color="secondary">
              Release
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.addressDialogOpen}
          keepMounted
          onClose={this.handleDialogClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            Enter a DCC address
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              If a locomotive isn't in the roster, you can enter the DCC address
              here:
            </DialogContentText>
            <form onSubmit={this.handleAddressSubmit}>
              <TextField
                inputRef={input => {
                  this.addressField = input
                }}
                id="address"
                label="DCC address"
                className={classes.textField}
                value={this.state.addressValue}
                onChange={this.handleAddressChange}
                margin="normal"
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogClose} color="default">
              Cancel
            </Button>
            <Button onClick={this.handleAddressSubmit} color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default withStyles(styles)(TrainForm)
