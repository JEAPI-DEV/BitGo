// Enums for GPIO Expander
const enum REG_MCP {
    Bitmuster_A = 0x12,
    Bitmuster_B = 0x13,
    EinOderAusgabe_A = 0x00,
    EinOderAusgabe_B = 0x01,
    PullUp_Widerstaende_A = 0x0c,
    PullUp_Widerstaende_B = 0x0d
}

const enum BITS {
    Alle = 0xff,
    Bit1 = 0x01
}

const enum PORTS {
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

const enum LineSensor{
    //% block="Left"
    //% block.loc.de="Linker"
    Left = 0,
    //% block="Right"
    //% block.loc.de="Rechter"
    Right = 1
}

// Variablen GPIO Expander
let BitwertA = 0x00;
let BitwertB = 0x00;
let IOBitsA = 0x00;
let IOBitsB = 0x00;

/**
 * Provides access to MicroBot functionality.
 */
//% color=140 weight=100 icon="\uf1ec" block="MicroBot"
//% groups=['Sensoren', 'Motoren', 'Lichter']
namespace MicroBot {
    let distance2;

    /**
     * Direction enum for driving.
     */
    export enum Direction {
        //% block="forward"
        //% block.loc.de="Vorwaerts"
        Forward,
        //% block="backward"
        //% block.loc.de="Rueckwerts"
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
    //% block.loc.de="distanz abrufen"
    //% group="Sensoren"
    //% weight=90
    export function getDistance(): number {
        pins.setPull(DigitalPin.P15, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P15, 0);
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P15, 1);
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P15, 0);

        // read pulse
        const d = pins.pulseIn(DigitalPin.P1, PulseValue.High, 500 * 58);

        distance2 = Math.idiv(d, 58);
        return distance2;
    }

    /**
     * Reads the values from both line sensors.
     */
    //% block="get %sensor=LineSensor line sensor"
    //% block.loc.de="%sensor=LineSensor Linien Sensor abrufen"
    //% group="Sensoren"
    //% weight=80
    export function getLineSensors(sensor: LineSensor): boolean {
        if (sensor == LineSensor.Left) {
            return digitalRead(PORTS.B0);
        } else {
            return digitalRead(PORTS.B1);
        }
    }

    /**
     * Control the headlights.
     * @param on whether to turn on or off the headlights
     */
    //% block="turn headlights %on=On/Off"
    //% block.loc.de="schalte Scheinwerfer %on=On/Off"
    //% group="Lichter"
    //% weight=60
    export function controlHeadlights(on: boolean): void {
        // Add code here to control the headlights
        digitalWrite(PORTS.A0, on);
    }

    /**
     * Drive in the specified direction at the given speed.
     * @param direction the direction to drive
     * @param speed the speed of the motors (0-100)
     */
    //% block="drive %direction|at speed $speed"
    //% block.loc.de="fahre %direction|mit eine geschwindigkeit von $speed"
    //% speed.min=0 speed.max=255
    //% group="Motoren"
    //% weight=50
    export function drive(direction: Direction, speed: number): void {
        // Add code here to drive in the specified direction
        // handle direction
        if (direction == Direction.Forward) {
            // links
            pins.analogWritePin(AnalogPin.P8, speed);
            pins.analogWritePin(AnalogPin.P16, 0);
            // rechts
            pins.analogWritePin(AnalogPin.P14, speed);
            pins.analogWritePin(AnalogPin.P12, 0);
        } else if (direction == Direction.Backward) {
            // links
            pins.analogWritePin(AnalogPin.P8, 0);
            pins.analogWritePin(AnalogPin.P16, speed);
            // rechts
            pins.analogWritePin(AnalogPin.P14, 0);
            pins.analogWritePin(AnalogPin.P12, speed);
        } else if (direction == Direction.Left) {
            // links
            pins.analogWritePin(AnalogPin.P8, speed / 2);
            pins.analogWritePin(AnalogPin.P16, 0);
            // rechts
            pins.analogWritePin(AnalogPin.P14, speed);
            pins.analogWritePin(AnalogPin.P12, 0);
        } else if (direction == Direction.Right) {
            // links
            pins.analogWritePin(AnalogPin.P8, speed);
            pins.analogWritePin(AnalogPin.P16, 0);
            // rechts
            pins.analogWritePin(AnalogPin.P14, speed / 2);
            pins.analogWritePin(AnalogPin.P12, 0);
        }
    }

    // Set the mode of a port
    //% blockId="pinMode"
    //% block="set %port as %mode"
    //% block.loc.de="setze %port als %mode"
    //% port.fieldEditor="gridpicker" port.fieldOptions.columns=4
    //% mode.fieldEditor="gridpicker" mode.fieldOptions.columns=2
    //% weight=80
    //% group="Beim Start"
    export function pinMode(port: PORTS, mode: Mode): void {
        let portIndex = port;
        let register: number;
        let ioBits: number;

        if (portIndex <= 8) {
            // Port is in Register A
            register = REG_MCP.EinOderAusgabe_A;
            ioBits = IOBitsA;
        } else {
            // Port is in Register B
            register = REG_MCP.EinOderAusgabe_B;
            ioBits = IOBitsB;
            portIndex -= 8;
        }

        if (mode === Mode.Output) {
            ioBits &= ~(BITS.Bit1 << (portIndex - 1));
        } else {
            ioBits |= (BITS.Bit1 << (portIndex - 1));
        }

        if (port <= 8) {
            IOBitsA = ioBits;
        } else {
            IOBitsB = ioBits;
        }

        MicroBot.writeRegister(register, ioBits);

        if (mode === Mode.Input) {
            let pullUpRegister = (port <= 8) ? REG_MCP.PullUp_Widerstaende_A : REG_MCP.PullUp_Widerstaende_B;
            MicroBot.writeRegister(pullUpRegister, ioBits);
        }
    }

    //% blockId="digitalRead"
    //% block="Input %port High"
    //% block.loc.de="Eingang %port Hoch"
    //% jsdoc.loc.de="Gibt ´wahr´ zurück wenn spannung anliegt."
    //% port.fieldEditor="gridpicker" port.fieldOptions.columns=4
    //% weight=80
    //% group="Ein- & Ausgang"
    export function digitalRead(port: PORTS): boolean {
        let portIndex = port;
        let register: number;
        
        if (portIndex <= 8) {
            // Port is in Register A
            register = REG_MCP.Bitmuster_A;
        } else {
            // Port is in Register B
            register = REG_MCP.Bitmuster_B;
            portIndex -= 8;
        }

        return MicroBot.ReadNotAnd(register, BITS.Bit1 << (portIndex - 1));
    }

    // Set the state of a port
    //% blockId="digitalWrite"
    //% block="switch %port | %zustand"
    //% block.loc.de="Aktiviere %port | %zustand"
    //% zustand.shadow="On/Off"
    //% port.fieldEditor="gridpicker" port.fieldOptions.columns=4
    //% weight=80
    //% group="Ein- & Ausgang"
    export function digitalWrite(port: PORTS, zustand: boolean): void {
        let portIndex = port;
        let bitMask = BITS.Bit1 << ((portIndex <= 8) ? (portIndex - 1) : (portIndex - 9));
        let bitwert: number;
        let register: number;

        if (portIndex <= 8) {
            // Port is in Register A
            bitwert = BitwertA;
            register = REG_MCP.Bitmuster_A;
        } else {
            // Port is in Register B
            bitwert = BitwertB;
            register = REG_MCP.Bitmuster_B;
            portIndex -= 8;
        }

        if (zustand) {
            bitwert |= bitMask;
        } else {
            bitwert &= ~bitMask;
        }

        if (port <= 8) {
            BitwertA = bitwert;
        } else {
            BitwertB = bitwert;
        }

        MicroBot.writeRegister(register, bitwert);
    }

    export function writeRegister(reg: REG_MCP, value: number) {
        pins.i2cWriteNumber(0x20, reg * 256 + value, NumberFormat.UInt16BE);
    }

    export function ReadNotAnd(reg: REG_MCP, value: number): boolean {
        return !(MicroBot.readRegister(reg) & value);
    }

    export function readRegister(reg: REG_MCP): number {
        pins.i2cWriteNumber(0x20, reg, NumberFormat.Int8LE);
        return pins.i2cReadNumber(0x20, NumberFormat.Int8LE);
    }
}
