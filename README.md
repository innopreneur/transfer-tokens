# Token Transfer Script
Transfers ERC-20 tokens serially to given addresses in a given csv file.

## Requirements
- [Node 8+](https://nodejs.org/en/)
- [Yarn (optional)](https://yarnpkg.com/en/)

## Setup

```
git clone https://github.com/innoprenuer/transfer-tokens.git
cd transfer-tokens
npm install
```

 - Fill `.env` from `.env.example` with the token contract address, wallets and amount, infura node details and exported private key.


```
NODE_ENV=development

INFURA_URL=https://rinkeby.infura.io/your-url
INFURA_WS_URL=wss://rinkeby.infura.io/ws

ETH_BLOCK_TIME=30

TOKEN_CONTRACT_ADDRESS=
PRIVATE_KEY=
WALLET_FROM=
```
- Copy your ERC-20 token contract's abi wih name `abi.json` to `abi/` folder.
- Repalce csv file with addresses in given sample `addresses.csv` with your desired address and amount details in same format.


## Running

Simply start the service and make a transfer from one wallet to another on Rindkeby testnet.

```
npm start
```
