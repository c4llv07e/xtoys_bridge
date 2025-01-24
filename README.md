# NSFW repo

# Xtoys bridge

Use xtoys's custom websocket/webhook toy to control buttplug.io vibrators.

## Instruction

### Websocket (only if you have public IP!)

- Go to [custom toys list](https://xtoys.app/me/custom-toys/ ).

- Press plus sign in the bottom-right corner.

- Press "Create a new websocket toy".

- Set `Websocket Info` to `ws://localhost:12346`.

- Save.

- Run this script with `node websocket.mjs`.

- Enjoy!

### Webhook (under NAT)

- Go to [custom toys list](https://xtoys.app/me/custom-toys/ ).

- Press plus sign in the bottom-right corner.

- Press "Create a new webhook toy".

- Press "Generate websocket info".

- Run tihs script with `node webhook.mjs --addr <websocket> --token <token>`.
  Replace `<websocket>` and `<token>` with values from webhook toy.

- Enjoy!

#### Little more info

If you want, you can pass this params with envrironment variables:
`XTOYS_ADDR` and `XTOYS_TOKEN`;

Save it into config `./config.txt` with content
```toml
address=<websocket>
token=<token>
```

Or just hardcode it.
