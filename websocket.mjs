import WebSocket from 'ws';
Object.assign(global, { WebSocket: WebSocket }); // I love js so much
import Buttplug from 'buttplug';

// Client here is a buttplug client.
// Server - xtoys "toy".

// Config
const bridge_address = "localhost";
const bridge_port = 12346;
const bp_address = "ws://localhost:12345";

const server = new WebSocket.Server({
  address: bridge_address,
  port: bridge_port
});

const connector = new
  Buttplug.ButtplugBrowserWebsocketClientConnector(bp_address);
const client = new Buttplug.ButtplugClient("Xtoys bridge");

client.addListener("deviceadded", (device) => {
  console.log(`Device connected: ${device.name}`);
});

client.addListener("deviceremoved", (device) => {
  console.log(`Device removed: ${device.name}`);
});

server.on('connection', (connection) => {
  connection.on('message', (msg) => {
    const command = JSON.parse(msg);
    const vibrate = command.vibrate;
    if (client.devices === undefined) return;
    client.devices.forEach((device) => device.vibrate(vibrate / 100));
  });
});

console.log("Connecting to the buttplug...");
try {
  await client.connect(connector);
} catch (e) {
  console.error("Can't connect to the bs server:", e);
  process.exit(-1);
}
console.log("Done");
console.log("Devices: ", client.devices);
