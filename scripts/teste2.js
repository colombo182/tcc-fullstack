//alert('teste');

console.log('teste');
//const fs = require('fs');
import {fs} from 'require';
console.log(fs);
//const Gpio = require('onoff').Gpio;
//console.log(require('onoff'));
import {Gpio} from './~/EspelhoInteligente/scripts/node_modules/onoff';
console.log(Gpio);
let upKey = new Gpio(26, 'in');
console.log(upKey);
let downKey = new Gpio(21, 'in');
console.log(downKey);

//alert('Valor');

let pressed = "not";
//alert(pressed);
//alert(upKey);
//alert(downKey);

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function teste_lib() {
  console.log('funcionou');
}

while(pressed === "not") {
  //alert('dsadsa');
  if (upKey.readSync() === 1) {
    pressed = "UP";
    console.log(pressed);
    //alert("Key UP pressed");
    sleep(1000);
    break
  }
  if (downKey.readSync() === 1) {
    pressed = "DOWN";
    console.log(pressed);
    //alert("Key DOWN pressed");
    sleep(1000);
    break
  }
}

module.exports = {teste_lib};
