const {

    Client,

    PrivateKey,

    AccountCreateTransaction,

    AccountBalanceQuery,

    Hbar,

    TransferTransaction,

    TopicCreateTransaction,

    KeyList,

    TopicMessageSubmitTransaction,

    ScheduleCreateTransaction,

    ScheduleSignTransaction,

    ScheduleInfoQuery,

    TopicUpdateTransaction

  } = require("@hashgraph/sdk");

  require("dotenv").config();

 

 

  async function environmentSetup() {

    // Grab your Hedera testnet account ID and private key from your .env file

    const myAccountId = process.env.MY_ACCOUNT_ID;

    const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

 

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

 

    // Create new keys

    const newAccountPrivateKey = PrivateKey.generateED25519();

    const newAccountPublicKey = newAccountPrivateKey.publicKey;

 

    // Create a new account with 1,000 tinybar starting balance

    const newAccount = await new AccountCreateTransaction()

      .setKey(newAccountPublicKey)

      .setInitialBalance(Hbar.fromTinybars(1000))

      .execute(client);

 

    // Get the new account ID

    const getReceipt = await newAccount.getReceipt(client);

    const newAccountId = getReceipt.accountId;

   

    console.log("\nNew account ID: " + newAccountId);

 

    // Verify the account balance

    const accountBalance = await new AccountBalanceQuery()

      .setAccountId(newAccountId)

      .execute(client);

 

    console.log("The new account balance is: " +accountBalance.hbars.toTinybars() +" tinybar.");

 

// Generate our key lists

const privateKeyList = [];

const publicKeyList = [];

for (let i = 0; i < 4; i += 1) {

     const privateKey = PrivateKey.generate();

     const publicKey = privateKey.publicKey;

     privateKeyList.push(privateKey);

     publicKeyList.push(publicKey);

     console.log(`${i}: pub key:${publicKey}`);

     console.log(`${i}: priv key:${privateKey}`);

}




// Create our threshold key

const thresholdKey =  new KeyList(publicKeyList,1);




console.log("The 1/3 threshold key structure" +thresholdKey);




//2.0.2

    // Create a new topic

let txResponse = await new TopicCreateTransaction()

.setSubmitKey(thresholdKey)

.setAdminKey(myPrivateKey.publicKey)

.execute(client);




// Grab the newly generated topic ID

let receipt = await txResponse.getReceipt(client);

let topicId = receipt.topicId;

console.log(`Your topic ID is: ${receipt.topicId}`);




// Wait 5 seconds between consensus topic creation and subscription creation

await new Promise((resolve) => setTimeout(resolve, 5000));




// Send message to private topic

let submitMsgTx = await new TopicMessageSubmitTransaction({

    topicId: topicId,

    message: "thresholdkey set!",

  })

  // .freezeWith(client)

  //  .sign(privateKeyList[1]);

 

 

  // let submitMsgTxSubmit =await( await submitMsgTx.sign(privateKeyList[2])).execute(client);

 

  // // Get the receipt of the transaction

  // let smgetReceipt = await submitMsgTxSubmit.getReceipt(client);

 

  // // Get the status of the transaction

  //  const transactionStatus = smgetReceipt.status;

  //  console.log("The message transaction status " + transactionStatus.toString());

//Create a schedule transaction

const transaction = new ScheduleCreateTransaction()

     .setScheduledTransaction(submitMsgTx);

    // .freezeWith(client);

    // .sign(privateKeyList[0]);




//Sign with the client operator key and submit the transaction to a Hedera network

const txResponses = await transaction.execute(client);




//Request the receipt of the transaction

const receipts = await txResponses.getReceipt(client);




//Get the schedule ID

const scheduleId = receipts.scheduleId;

console.log("The schedule ID of the schedule transaction is " +scheduleId);





//Create the transaction

const transactionsign = await new ScheduleSignTransaction()

     .setScheduleId(scheduleId)

     .freezeWith(client)

     .sign(privateKeyList[0]);




//Sign with the client operator key to pay for the transaction and submit to a Hedera network

const txResponsesign = await transactionsign.execute(client);




//Get the receipt of the transaction

const receiptsign = await txResponsesign.getReceipt(client);




//Get the transaction status

const transactionStatus = receiptsign.status;

console.log("The transaction consensus status is " +transactionStatus.toString());




//Create the query

const query = new ScheduleInfoQuery()

     .setScheduleId(scheduleId);




//Sign with the client operator private key and submit the query request to a node in a Hedera network

const info = await query.execute(client);

const signatories= info.expirationTime;

console.log(signatories.toString());

const publicKeyList1 = [];

publicKeyList1.push(myPrivateKey.publicKey);

const thresholdKeyupdate =  new KeyList(publicKeyList1,1);




//Create a transaction to add a submit key

const transactionupdate = await new TopicUpdateTransaction()

    .setTopicId(topicId)

    .setSubmitKey(thresholdKeyupdate)

    .freezeWith(client);




//Sign the transaction with the admin key to authorize the update

const signTx = await transactionupdate.sign(myPrivateKey);

   

//Sign with the client operator private key and submit to a Hedera network

const txResponseupdate = await signTx.execute(client);




//Request the receipt of the transaction

const receiptupdate = await txResponseupdate.getReceipt(client);




//Get the transaction consensus status

const transactionStatusupdate = receiptupdate.status;




console.log("The transaction consensus status is " +transactionStatusupdate.toString());




//v2.0.0




return newAccountId;

  }




  environmentSetup();