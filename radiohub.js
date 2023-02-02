const UUID_primary = "46039343-5555-4763-bbe6-27f4090900fa";
const UUID_tx = "f746fbd8-00a1-4b73-a78e-c6930248d9d2";
const UUID_rx = "3eb78376-422c-4b34-a6f0-a0c826388b11";
const status_element = document.getElementById('status');
var device;
var char_tx;

async function select() {
  try {
    console.log('Request a device');
    device = await navigator.bluetooth.requestDevice({
      filters: [
          {services: [UUID_primary]},
          {namePrefix: document.querySelector('#deviceNamePrefix').value}
      ]
    });
    device.addEventListener('gattserverdisconnected', onDisconnected);
    console.log('Got device: ' + device.name + ' (' + device.id +')');
  } catch (error) {
    console.log('Argh! ' + error);
  }
}

async function connect() {
  try {

    console.log('Connect to the device');
    const server = await device.gatt.connect();

    console.log('Get the primary service');
    const service = await server.getPrimaryService(UUID_primary);

    console.log('getCharacteristic rx');
    const char_rx = await service.getCharacteristic(UUID_rx);
    console.log('getCharacteristic tx');
    char_tx = await service.getCharacteristic(UUID_tx);

    console.log('addEventListener');
    char_rx.addEventListener('characteristicvaluechanged', handleMessage);

    console.log('Enable notifications on the RX characteristic');
    await char_rx.startNotifications();

    status_line('Connected');
  } catch (error) {
      status_line('Argh! ' + error);
      try {
          await device.gatt.disconnect(); }
      catch (error) {
          console.log('Argh!Argh!! ' + error); 
      }
  }
}

function status_line(str){
  status_element.value += str + "\n";
  status_element.scrollTop = status_element.scrollHeight;
}

function onDisconnected(event) {
    status_line("Disconnected");
}

function handleMessage(event) {
    const value = new TextDecoder().decode(event.target.value);
    status_line("in[" + value + "]");
    console.log("Received message: " + value);
}

async function sendMessage() {
    console.log("Sending a message");
    await char_tx.writeValue(new TextEncoder().encode("\0Hello!"));
}

async function disconnect() {
    console.log("Disconnecting");
    await device.gatt.disconnect();
}


async function checkInput(event) {
    var keyCode = event.hasOwnProperty('which') ? event.which : event.keyCode;
    console.log('keypress ' + keyCode);
    try {
        await char_tx.writeValue(new Uint8Array([0, keyCode]));
    } catch (error) {
        console.log('Argh! ' + error);
    }
}

//document.getElementById("status").addEventListener("keypress", checkInput)
document.addEventListener("keypress", checkInput)