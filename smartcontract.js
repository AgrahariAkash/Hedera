const {

  AccountId,

  PrivateKey,

  Client,

  FileCreateTransaction,

  ContractCreateTransaction,

  ContractFunctionParameters,

  ContractExecuteTransaction,

  ContractCallQuery,

  Hbar,

} = require("@hashgraph/sdk");

const fs = require("fs");

require("dotenv").config();






// Configure accounts and client

const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);

const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);




const client =Client.forTestnet().setOperator(operatorId,operatorKey);




async function main() {

  //Import the compiled bytecode

  const contractBytecode = fs.readFileSync("hellohedera_sol_HelloHedera.bin");




  //Create a file on Hedera and store the bytecode




  const fileCreateTx = new FileCreateTransaction()

   .setContents(contractBytecode)

   .setKeys([operatorKey])

   .setMaxTransactionFee(new Hbar(100))

   .freezeWith(client);

   const fileCreateSign = await fileCreateTx.sign(operatorKey);

   const fileCreateSubmit = await fileCreateSign.execute(client);

   const fileCreateRx = await fileCreateSubmit.getReceipt(client);

   const bytecodeFileId = fileCreateRx.fileId;

   console.log(`- The bytecode file  ID is: ${bytecodeFileId} \n`);




   //Instantiate the smart contract




   const contractInstantiateTx = new ContractCreateTransaction()

    .setBytecodeFileId(bytecodeFileId)

    .setGas(100000)

    .setConstructorParameters(new ContractFunctionParameters().addString("Alice").addUint256(111111));




    const contractInstantiateSubmit = await contractInstantiateTx.execute(client);

    const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client);

    const contractId = contractInstantiateRx.contractId;

    const contractAddress = contractId.toSolidityAddress();

    console.log(`- The smart contract ID is: ${contractId} \n`);

    console.log(`- The smart contract ID in Solidity format is: ${contractAddress} \n`);




    //Query the contract to check changes in state variable




    const contractQueryTx = new ContractCallQuery()

    .setContractId(contractId)

    .setGas(1000000)

    .setFunction("getMobileNumber",new ContractFunctionParameters().addString("Alice"))

    .setMaxQueryPayment(new Hbar(100000000));




    const contractQuerySubmit = await contractQueryTx.execute(client);

    const contractQueryResult = contractQuerySubmit.getUint256(0);

    console.log(`- Here's the phone number that you asked for: ${contractQueryResult} \n`);




    //Call contract function to update the state variable

    const contractExecuteTx = new ContractExecuteTransaction()

        .setContractId(contractId)

        .setGas(100000)

        .setFunction("setMobileNumber", new ContractFunctionParameters().addString("Bob").addUint256(222222))

        .setMaxTransactionFee(new Hbar (0.75));




        const contractExecuteSubmit = await contractExecuteTx.execute(client);

        const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);

        console.log(`- Contract function call status: ${contractExecuteRx.status} \n `);






  //Query the contract to check changes in state variable




  const contractQueryTx1 = new ContractCallQuery()

  .setContractId(contractId)

  .setGas(1000000)

  .setFunction("getMobileNumber",new ContractFunctionParameters().addString("Bob"))

  .setMaxQueryPayment(new Hbar(100));




  const contractQuerySubmit1 = await contractQueryTx1.execute(client);

  const contractQueryResult1 = contractQuerySubmit1.getUint256(0);

  console.log(`- Here's the phone number that you asked for: ${contractQueryResult1} \n`);




 





}

main();