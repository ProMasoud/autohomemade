/**
   * [android]
   * request enable of bluetooth from user
   */
 export const requestEnable = () => {
    BluetoothSerial.requestEnable()
    .then((res) => this.setState({ isEnabled: true }))
    .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * [android]
   * enable bluetooth on device
   */
  export const enable= () =>{
    BluetoothSerial.enable()
    .then((res) => this.setState({ isEnabled: true }))
    .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * [android]
   * disable bluetooth on device
   */
  export const disable= ()=> {
    BluetoothSerial.disable()
    .then((res) => this.setState({ isEnabled: false }))
    .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * [android]
   * toggle bluetooth
   */
  export const toggleBluetooth= (value)=> {
    if (value === true) {
      this.enable()
    } else {
      this.disable()
    }
  }

  /**
   * [android]
   * Discover unpaired devices, works only in android
   */
  export const discoverUnpaired= ()=> {
    if (this.state.discovering) {
      return false
    } else {
      this.setState({ discovering: true })
      BluetoothSerial.discoverUnpairedDevices()
      .then((unpairedDevices) => {
        console.log(unpairedDevices);
        this.setState({ unpairedDevices, discovering: false })
      })
      .catch((err) => Toast.showShortBottom(err.message))
    }
  }

  /**
   * [android]
   * Discover unpaired devices, works only in android
   */
  export const cancelDiscovery= () =>{
    if (this.state.discovering) {
      BluetoothSerial.cancelDiscovery()
      .then(() => {
        this.setState({ discovering: false })
      })
      .catch((err) => Toast.showShortBottom(err.message))
    }
  }

  /**
   * [android]
   * Pair device
   */
  export const pairDevice= (device)=> {
    BluetoothSerial.pairDevice(device.id)
    .then((paired) => {
      if (paired) {
        Toast.showShortBottom(`Device ${device.name} paired successfully`)
        const devices = this.state.devices
        devices.push(device)
        this.setState({ devices, unpairedDevices: this.state.unpairedDevices.filter((d) => d.id !== device.id) })
      } else {
        Toast.showShortBottom(`Device ${device.name} pairing failed`)
      }
    })
    .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * Connect to bluetooth device by id
   * @param  {Object} device
   */
  export const connect= (device) =>{
    this.setState({ connecting: true })
    BluetoothSerial.connect(device.id)
    .then((res) => {
      Toast.showShortBottom(`Connected to device ${device.name}`)
      this.setState({ device, connected: true, connecting: false })
      this.writePackets('Masoud', 16);
    })
    .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * Disconnect from bluetooth device
   */
  export const disconnect= () =>{
    BluetoothSerial.disconnect()
    .then(() => this.setState({ connected: false }))
    .catch((err) => Toast.showShortBottom(err.message))
  }

  /**
   * Toggle connection when we have active device
   * @param  {Boolean} value
   */
  export const toggleConnect= (value) =>{
    if (value === true && this.state.device) {
      this.connect(this.state.device)
    } else {
      this.disconnect()
    }
  }

  /**
   * Write message to device
   * @param  {String} message
   */
  export const write= (message) =>{
    if (!this.state.connected) {
      Toast.showShortBottom('You must connect to device first')
    }

    BluetoothSerial.write(message)
    .then((res) => {
      Toast.showShortBottom('Successfuly wrote to device')
      this.setState({ connected: true })
    })
    .catch((err) => Toast.showShortBottom(err.message))
  }

  export const onDevicePress= (device)=> {
    if (this.state.section === 0) {
      this.connect(device)
    } else {
      this.pairDevice(device)
    }
  }

  export const writePackets = (message, packetSize = 64)=> {
    const toWrite = iconv.encode(message, 'cp852')
    const writePromises = []
    const packetCount = Math.ceil(toWrite.length / packetSize)

    for (var i = 0; i < packetCount; i++) {
      const packet = new Buffer(packetSize)
      packet.fill(' ')
      toWrite.copy(packet, 0, i * packetSize, (i + 1) * packetSize)
      writePromises.push(BluetoothSerial.write(packet))
    }

    Promise.all(writePromises)
    .then((result) => {
    })
  }
