## Akroma Desktop

Akroma Desktop is an application that can be used on Linux, Mac and Windows. It communicates with the Akroma bootnodes and the Akroma API (https://api.akroma.org/docs#/)

<img src="/screenshots/akroma-desktop.png" alt="drawing" width="75%"/>

### Features
- Create wallet
  - wallet name
- Import wallets from the `~/.akroma/keystore` folder
- Wallet details
  - Balance
  - Transactions
- Send AKA
  - Currently can only send to an existing contact
- Contacts
  - Mapping of address and name
  
### Releases

Get the latest release from here:
https://github.com/akroma-project/akroma-desktop/releases

  
## Development

This is the official Wails Vue-TS template.

You can configure the project by editing `wails.json`. More information about the project settings can be found
here: https://wails.io/docs/reference/project-config

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.
