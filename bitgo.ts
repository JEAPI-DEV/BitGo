enum REGISTER {
  //% Bitmuster um Register A zu beschreiben
  Bitmuster_A = 0x12,
  //% Bitmuster um Register B zu beschreiben
  Bitmuster_B = 0x13,
  //% Aus- / Eingaberichtung des Registers A
  EinOderAusgabe_A = 0x00, // Register stehen standardmäßig auf Eingabe (1111 1111)
  //% Aus- / Eingaberichtung des Registers B
  EinOderAusgabe_B = 0x01,
  //% Pullup Widerstände Register A
  PullUp_Widerstaende_A = 0x0c,
  //% Pullup Widerstände Register B
  PullUp_Widerstaende_B = 0x0d
}

const enum Ports {
  A0 = 1,
  A1 = 2,
  A2 = 3,
  A3 = 4,
  A4 = 5,
  A5 = 6,
  A6 = 7,
  A7 = 8,
  B0 = 9,
  B1 = 10,
  B2 = 11,
  B3 = 12,
  B4 = 13,
  B5 = 14,
  B6 = 15,
  B7 = 16
}

const enum Mode {
  //% block="Input"
  //% block.loc.de="Eingang"
  Input = 0,
  //% block="Output"
  //% block.loc.de="Ausgang"
  Output = 1
}

const enum LineSensor {
  //% block="Left"
  //% block.loc.de="Linker"
  Left = 0,
  //% block="Right"
  //% block.loc.de="Rechter"
  Right = 1
}

// Variablen GPIO Expander
let BitwertA = 0x00
let BitwertB = 0x00
let IOBitsA = 0x00
let IOBitsB = 0x00

// Track the mode of each port
let portModes: { [port: number]: Mode } = {}

/**
 * Provides access to BitGo functionality.
 */
//% color=140 weight=100 icon="\uf1ec" block="BitGo"
//% groups=['Sensoren', 'Motoren', 'Lichter', 'Beim Start', 'Ein- & Ausgang']
namespace BitGo {
  let distance2: number

  /**
   * Direction enum for driving.
   */
  export enum Direction {
    //% block="forward"
    //% block.loc.de="Vorwärts"
    Forward,
    //% block="backward"
    //% block.loc.de="Rückwärts"
    Backward,
    //% block="left"
    //% block.loc.de="Links"
    Left,
    //% block="right"
    //% block.loc.de="Rechts"
    Right
  }

  /**
   * Reads the distance from the sonar sensor.
   */
  //% block="get distance"
  //% block.loc.de="Distanz abrufen"
  //% group="Sensoren"
  //% weight=90
  export function getDistance (): number {
    pins.setPull(DigitalPin.P13, PinPullMode.PullNone)
    pins.digitalWritePin(DigitalPin.P13, 0)
    control.waitMicros(2)
    pins.digitalWritePin(DigitalPin.P13, 1)
    control.waitMicros(10)
    pins.digitalWritePin(DigitalPin.P13, 0)

    // read pulse
    const d = pins.pulseIn(DigitalPin.P1, PulseValue.High)

    distance2 = Math.idiv(d, 58)
    return distance2
  }

  /**
   * Reads the values from both line sensors.
   */
  //% block="get %sensor=LineSensor line sensor"
  //% block.loc.de="%sensor=LineSensor Linien Sensor abrufen"
  //% group="Sensoren"
  //% weight=80
  export function getLineSensors (sensor: LineSensor): boolean {
    if (sensor == LineSensor.Left) {
      return !digitalRead(Ports.B0)
    } else {
      return !digitalRead(Ports.B1)
    }
  }

  /**
   * Control the headlights.
   * @param on whether to turn on or off the headlights
   */
  //% block="turn headlights %on=toggleOnOff"
  //% block.loc.de="Scheinwerfer %on=toggleOnOff schalten"
  //% group="Lichter"
  //% weight=60
  export function controlHeadlights (on: boolean): void {
    ensurePinMode(Ports.A0, Mode.Output)
    digitalWrite(Ports.A0, on)
  }

  /**
   * Drive in the specified direction at the given speed.
   * @param direction the direction to drive
   * @param speed the speed of the motors (0-100)
   */
  //% block="drive %direction|at speed $speed"
  //% block.loc.de="fahre %direction|mit einer Geschwindigkeit von $speed"
  //% speed.min=0 speed.max=255
  //% group="Motoren"
  //% weight=50
  export function drive (direction: Direction, speed: number): void {
    if (direction == Direction.Forward) {
      // links
      pins.analogWritePin(AnalogPin.P8, speed)
      pins.analogWritePin(AnalogPin.P16, 0)
      // rechts
      pins.analogWritePin(AnalogPin.P14, speed)
      pins.analogWritePin(AnalogPin.P12, 0)
    } else if (direction == Direction.Backward) {
      // links
      pins.analogWritePin(AnalogPin.P8, 0)
      pins.analogWritePin(AnalogPin.P16, speed)
      // rechts
      pins.analogWritePin(AnalogPin.P14, 0)
      pins.analogWritePin(AnalogPin.P12, speed)
    } else if (direction == Direction.Left) {
      // links
      pins.analogWritePin(AnalogPin.P8, speed / 2)
      pins.analogWritePin(AnalogPin.P16, 0)
      // rechts
      pins.analogWritePin(AnalogPin.P14, speed)
      pins.analogWritePin(AnalogPin.P12, 0)
    } else if (direction == Direction.Right) {
      // links
      pins.analogWritePin(AnalogPin.P8, speed)
      pins.analogWritePin(AnalogPin.P16, 0)
      // rechts
      pins.analogWritePin(AnalogPin.P14, speed / 2)
      pins.analogWritePin(AnalogPin.P12, 0)
    }
  }

  /**
   * Drive in the specified direction at the given speed.
   * @param direction the direction to drive
   * @param speed the speed of the motors (0-100)
   */
  //% block="stop the Motors"
  //% block.loc.de="Stoppe die Motoren"
  //% group="Motoren"
  //% weight=50
  export function stopMotors (): void {
    pins.analogWritePin(AnalogPin.P8, 0)
    pins.analogWritePin(AnalogPin.P16, 0)
    // rechts
    pins.analogWritePin(AnalogPin.P14, 0)
    pins.analogWritePin(AnalogPin.P12, 0)
  }

  export function pinMode (port: Ports, mode: Mode): void {
    if (portModes[port] === mode) {
      // Already set to the correct mode
      return
    }

    let portIndex = port
    let register: number
    let ioBits: number

    if (portIndex <= 8) {
      // Port is in Register A
      register = REGISTER.EinOderAusgabe_A
      ioBits = IOBitsA
    } else {
      // Port is in Register B
      register = REGISTER.EinOderAusgabe_B
      ioBits = IOBitsB
      portIndex -= 8
    }

    if (mode === Mode.Output) {
      ioBits &= ~(0x01 << (portIndex - 1))
    } else {
      ioBits |= 0x01 << (portIndex - 1)
    }

    if (port <= 8) {
      IOBitsA = ioBits
    } else {
      IOBitsB = ioBits
    }

    BitGo.Registerwrite(register, ioBits)

    if (mode === Mode.Input) {
      let pullUpRegister =
        port <= 8
          ? REGISTER.PullUp_Widerstaende_A
          : REGISTER.PullUp_Widerstaende_B
      BitGo.Registerwrite(pullUpRegister, ioBits)
    }

    portModes[port] = mode // Track the mode
  }

  /**
   * Returns 'true' when the port is connected to ground.
   * @param port Port
   * @return boolean
   */
  //% blockId="digitalRead"
  //% block="Input %port High"
  //% block.loc.de="Eingang %port Hoch"
  //% jsdoc.loc.de="Gibt 'wahr' zurück wenn der Eingang mit GND verbunden wurde, der Port des BitGo muss als Eingang festgelegt sein."
  //% port.fieldEditor="gridpicker" port.fieldOptions.columns=4
  //% weight=87
  //% group="Ein- & Ausgang"
  export function digitalRead (port: Ports): boolean {
    ensurePinMode(port, Mode.Input)

    let portIndex = port
    let register: number

    if (portIndex <= 8) {
      // Port is in Register A
      register = REGISTER.Bitmuster_A
    } else {
      // Port is in Register B
      register = REGISTER.Bitmuster_B
      portIndex -= 8
    }

    return BitGo.NotRead(register, 0x01 << (portIndex - 1))
  }

  /**
   * Set the state of a port
   * @param port Port
   * @param zustand State
   */
  //% blockId="digitalWrite"
  //% block="switch %port | %zustand"
  //% block.loc.de="schalte %port | %zustand"
  //% zustand.shadow="toggleOnOff"
  //% port.fieldEditor="gridpicker" port.fieldOptions.columns=4
  //% weight=88
  //% group="Ein- & Ausgang"
  export function digitalWrite (port: Ports, zustand: boolean): void {
    ensurePinMode(port, Mode.Output)

    let portIndex = port
    let bitMask = 0x01 << (portIndex <= 8 ? portIndex - 1 : portIndex - 9)
    let bitwert: number
    let register: number

    if (portIndex <= 8) {
      // Port is in Register A
      bitwert = BitwertA
      register = REGISTER.Bitmuster_A
    } else {
      // Port is in Register B
      bitwert = BitwertB
      register = REGISTER.Bitmuster_B
      portIndex -= 8
    }

    if (zustand) {
      bitwert |= bitMask
    } else {
      bitwert &= ~bitMask
    }

    if (port <= 8) {
      BitwertA = bitwert
    } else {
      BitwertB = bitwert
    }

    BitGo.Registerwrite(register, bitwert)
  }

  function ensurePinMode (port: Ports, mode: Mode): void {
    if (portModes[port] !== mode) {
      pinMode(port, mode)
    }
  }

  export function Registerwrite (reg: REGISTER, data: number) {
    const regValue = reg * 256 + data
    pins.i2cWriteNumber(0x20, regValue, NumberFormat.UInt16BE)
  }

  export function NotRead (reg: REGISTER, data: number): boolean {
    const registerValue = RegisterRead(reg)
    return (registerValue & data) === 0
  }

  export function RegisterRead (reg: REGISTER): number {
    pins.i2cWriteNumber(0x20, reg, NumberFormat.UInt8LE)
    return pins.i2cReadNumber(0x20, NumberFormat.UInt8LE)
  }
}
