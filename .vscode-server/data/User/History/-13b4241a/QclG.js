const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
} = require("@hashgraph/sdk");
require("dotenv").config();

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

  const accountKeys = [];

  for (let i = 0; i < 5; i++) {

    const privateKey = await client.generatePrivateKey();

    const publicKey = privateKey.publicKey;

    accountKeys.push({ privateKey, publicKey });

  }


  // Create accounts using the generated keys

  const accountIds = [];

  for (const keys of accountKeys) {

    const transactionResponse = await new AccountCreateTransaction()

      .setKey(keys.publicKey)

      .execute(client);


    const transactionReceipt = await transactionResponse.getReceipt(client);

    const accountId = transactionReceipt.accountId;

    accountIds.push(accountId.toString());

  }


  console.log("Account IDs:", accountIds);

}


createAccounts().catch((error) => {

  console.error("Error creating accounts:", error);

});

