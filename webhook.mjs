import WebSocket from 'ws';
Object.assign(global, { WebSocket: WebSocket });
import Buttplug from 'buttplug';
import fs from 'node:fs';

// Config
let xtoys_addr_code = undefined;
let xtoys_token_code = undefined;
const bp_address = "ws://localhost:12345";

function arg_val_find(arr, key) {
  return arr.includes(key) ? arr[arr.indexOf(key) + 1] : undefined;
};

const argv_prefixes = ["", "-", "--", "+", "/"];

function argv_find(names) {
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    for (let j = 0; j < argv_prefixes.length; j += 1) {
      const prefix = argv_prefixes[j];
      let found = arg_val_find(process.argv, prefix + name);
      if (found !== undefined) {
        return found;
      };
    };
  };
};

function ini_find(files, names) {
  for (let j = 0; j < files.length; j += 1) {
    try {
      const filename = files[j];
      const file_text = fs.readFileSync(filename, { "encoding": "utf-8"});
      for (let i = 0; i < names.length; i += 1) {
        const name = names[i];
        const found = file_text.slice(file_text.indexOf(name + "="),
            file_text.indexOf(name + "=") + file_text.slice(
              file_text.indexOf(name + "=")).indexOf("\n")).slice(
                (name + "=").length);
        if (found !== "") {
          return found;
        };
      };
    } catch (e) {
      if (e.code !== "ENOENT") {
        console.error("Error, can't open config file:\n", e);
      };
    };
  };
};

const xtoys_addr_argv = argv_find(["addr", "address", "soket",
  "websocket"]);
const xtoys_token_argv = argv_find(["token", "tok"]);

const xtoys_addr_env = (process.env["XTOYS_ADDR"]
  || process.env["XTOYS_ADDRESS"] || process.env["xtoys_addr"]
  || process.env["xtoys_address"] || process.env["XTOYS_SOCKET"]
  || process.env["XTOYS_WEBSOCKET"] || process.env["xtoys_socket"]
  || process.env["xtoys_websocket"]);

const xtoys_token_env = (process.env["XTOYS_tok"]
  || process.env["XTOYS_TOKEN"] || process.env["xtoys_tok"]
  || process.env["xtoys_token"]);

if (fs !== undefined) {
  const configs = ["./config.txt", "./config.txt.txt", "./config",
    "./config.ini"];
  const xtoys_addr_file = ini_find(configs, ["address", "addr", "ADDRESS",
    "ADDR", "xtoys_addr", "xtoys_address", "socket", "websocket"]);
  const xtoys_token_file = ini_find(configs, ["token", "tok", "TOKEN",
    "TOK", "xtoys_token", "xtoys_tok"]);
} else {
  const xtoys_addr_file = undefined;
  const xtoys_token_file = undefined;
};

const xtoys_addr = (xtoys_addr_code || xtoys_addr_argv || xtoys_addr_env
  || xtoys_addr_file || undefined);
const xtoys_token = (xtoys_token_code || xtoys_token_argv
  || xtoys_token_env || xtoys_token_file || undefined);

if (xtoys_addr === undefined) {
  console.error("Error, address isn't set");
  process.exit(-1);
};

if (xtoys_token === undefined) {
  console.error("Error, token isn't set");
  process.exit(-1);
};

const xtoys = new WebSocket(`wss://webhook.xtoys.app/${xtoys_addr}`, {
  headers: {
    Authorization: `Bearer ${xtoys_token}`
  }
});

const connector = new
  Buttplug.ButtplugBrowserWebsocketClientConnector(bp_address);
const bp = new Buttplug.ButtplugClient("Xtoys bridge");

bp.addListener("deviceadded", (device) => {
  console.log(`Device connected: ${device.name}`);
});

bp.addListener("deviceremoved", (device) => {
  console.log(`Device removed: ${device.name}`);
});

xtoys.on('message', (msg) => {
  const command = JSON.parse(msg);
  const vibrate = command.vibrate;
  if (bp.devices === undefined) return;
  bp.devices.forEach((device) => device.vibrate(vibrate / 100));
});

console.log("Connecting to the buttplug...");
try {
  await bp.connect(connector);
} catch (e) {
  console.error("Can't connect to the bs server:", e);
  process.exit(-1);
}
console.log("Done");
console.log("Devices: ", bp.devices);
