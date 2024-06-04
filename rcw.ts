/**
 * Provides access to RCW-0001 functionality.
 */
//% color=140 weight=100 icon="\uf018" block="RCW-0001"
namespace RCW0001 {
  //% block="Ultrasonic Sensor (in cm) trigger at|%trig| and echo at|%echo"
  //% block.loc.de="Ultraschall Sensor (in cm) trigger auf|%trig| und echo auf|%echo"
  //% pin.fieldEditor="gridpicker" pin.fieldOptions.columns=4
  //% pin.fieldOptions.tooltips="false" pin.fieldOptions.width="250"
  //% group="Ultrasonic" trig.defl=DigitalPin.C8 echo.defl=DigitalPin.C9
  export function ping(trig: DigitalPin, echo: DigitalPin): number {
      // send pulse
      pins.setPull(trig, PinPullMode.PullNone);
      pins.digitalWritePin(trig, 0);
      control.waitMicros(2);
      pins.digitalWritePin(trig, 1);
      control.waitMicros(10);
      pins.digitalWritePin(trig, 0);

      // read pulse
      const d = pins.pulseIn(echo, PulseValue.High);

      return Math.idiv(d, 58);
  }
}
