

const { Client } = require("@hashgraph/sdk");


async function createAccounts() {

  const client = Client.forTestnet(); // Use Client.forMainnet() for the mainnet


  // Generate 5 new keys

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