const {

    Client,

    PrivateKey,

    AccountCreateTransaction,

    AccountBalanceQuery,

    Hbar,

    FileCreateTransaction,

    ContractCreateTransaction,

    ContractFunctionParameters,

    ContractExecuteTransaction

  } = require("@hashgraph/sdk");

  require("dotenv").config();

  let fs = require('fs');

 

 

  async function environmentSetup() {

    // Grab your Hedera testnet account ID and private key from your .env file

    const myAccountId = process.env.MY_ACCOUNT_ID;

    const myPrivateKey = process.env.MY_PRIVATE_KEY;

 

    // If we weren't able to grab it, we should throw a new error

    if (myAccountId == null || myPrivateKey == null) {

      throw new Error(

        "Environment variables myAccountId and myPrivateKey must be present"

      );

    }

 

    // Create your connection to the Hedera Network

    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

 

    //Set the default maximum transaction fee (in Hbar)

    client.setDefaultMaxTransactionFee(new Hbar(100));

 

    //Set the maximum payment for queries (in Hbar)

    client.setMaxQueryPayment(new Hbar(50));

//Import the compiled contract from the HelloHedera.json file

// let helloHedera = require("./HelloHedera.json");

// const bytecode = helloHedera.data.bytecode.object;

const bytecode = fs.readFileSync('./FactoryContract_sol_FactoryContact.bin');

//Create a file on Hedera and store the hex-encoded bytecode

const fileCreateTx = new FileCreateTransaction()

        //Set the bytecode of the contract

        .setContents(bytecode);




//Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client

const submitTx = await fileCreateTx.execute(client);




//Get the receipt of the file create transaction

const fileReceipt = await submitTx.getReceipt(client);




//Get the file ID from the receipt

const bytecodeFileId = fileReceipt.fileId;




//Log the file ID

console.log("The smart contract byte code file ID is " +bytecodeFileId)




// Instantiate the contract instance

const contractTx = await new ContractCreateTransaction()

      //Set the file ID of the Hedera file storing the bytecode

      .setBytecodeFileId(bytecodeFileId)

      //Set the gas to instantiate the contract

      .setGas(100000)

      //Provide the constructor parameters for the contract

      .setConstructorParameters(new ContractFunctionParameters().addString("Hello from Hedera!"));




//Submit the transaction to the Hedera test network

const contractResponse = await contractTx.execute(client);




//Get the receipt of the file create transaction

const contractReceipt = await contractResponse.getReceipt(client);




//Get the smart contract ID

const newContractId = contractReceipt.contractId;




//Log the smart contract ID

console.log("The smart contract ID is " + newContractId);




//Create the transaction

const childcreatetransaction = new ContractExecuteTransaction()

     .setContractId(newContractId)

     .setGas(10000000)

     .setFunction("createContract", new ContractFunctionParameters().addUint256(10));




//Sign with the client operator private key to pay for the transaction and submit the query to a Hedera network

const txResponse = await childcreatetransaction.execute(client);




//Request the receipt of the transaction

const receipt = await txResponse.getReceipt(client);




//Get the transaction consensus status

const transactionStatus = receipt.status;




console.log("The transaction consensus status is " +transactionStatus);




//v2.0.0




//v2 JavaScript SDK

  }





environmentSetup();