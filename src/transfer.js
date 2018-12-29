const Web3  = require('web3');
const Tx = require('ethereumjs-tx');
const BigNumber = require('bignumber.js');
const csvParser = require('./parser');
const abi = require('../abi/abi');
require('./env')

//instantite web3
let web3 = new Web3();

//set infura provider
web3.setProvider(new web3.providers.HttpProvider(process.env.INFURA_URL));

//create token instance from abi and contract address
const tokenInstance = new web3.eth.Contract(abi, process.env.TOKEN_CONTRACT_ADDRESS, 
    {
        from: process.env.WALLET_FROM, // default from address
        gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
    }
);

//addresses to send given amount of token to
const toAddresses = csvParser();

//helper function to parse amount from csv and convert into ERC-20 token's 18 decimal digit
const parseAmount = (preformattedAmount) => {
    bn =  new BigNumber(Number(preformattedAmount.trim()));
    tokenUnit = new BigNumber(10);
    tokenUnit = tokenUnit.exponentiatedBy(18);
    return (bn.multipliedBy(tokenUnit)).toPrecision();
}
//counter for given address location
let i = 0;

//transfer function
async function transferTokens(to, amount){
    
    var gasPrice = await web3.eth.getGasPrice();
    var privKey = new Buffer.from(process.env.PRIVATE_KEY, 'hex');
    var gasLimit = 2000000;
    var data = tokenInstance.methods.transfer(to, amount).encodeABI();
    //console.log("estimates - " + web3.eth.estimateGas({data, from: process.env.WALLET_FROM}))
    //get current nonce
    web3.eth.getTransactionCount(process.env.WALLET_FROM, "pending", async (err, nonce) => {
    
      if(!err){
        //create tx object
        var rawTransaction = {
          "from": process.env.WALLET_FROM,
          "nonce": nonce,
          "gasPrice": web3.utils.toHex(gasPrice),
          "gasLimit": web3.utils.toHex(gasLimit),
          "to": process.env.TOKEN_CONTRACT_ADDRESS,
          "value": 0,
          "data": data,
          "chainId": process.env.CHAIN_ID //1 for mainnet, 3 for ropsten, 4 for rinkeby
        };
    
        var tx = new Tx(rawTransaction);

        //sign the transaction
        tx.sign(privKey);

        //serialize the given tx to send it to blockchain
        var serializedTx = tx.serialize();
    
        // send our signed tx to ethereum blockchain
        let signedTx = web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        signedTx
            .on('transactionHash', function(hash){
                console.log(`Transferring ${toAddresses[i].Address} to ${toAddresses[i].Amount} via tx ${hash}`)
            })
            .on('confirmation', function(confirmation, receipt){
                console.log(`***********Record(${toAddresses[i].ID}) confirmation : ${confirmation} *********************`)
                //console.log(receipt)
                //on 12th confirmation, its relatively safe that tx is processed
                //so we start another tx
                if(parseInt(confirmation) > 12){
                    i++;
                    //stop listening to this tx events
                    signedTx.off('confirmation');
                    //send another transaction
                    console.log('Processing record ' + toAddresses[i].ID);
                    return transferTokens(toAddresses[i].Address, parseAmount(toAddresses[i].Amount));

                }
                
            })
            .on('error', console.error);
        }
      else {
          //failed transaction can also be retried here.
        console.log(err);
      }
       
      });  
  }

transferTokens(toAddresses[i].Address, parseAmount(toAddresses[i].Amount));