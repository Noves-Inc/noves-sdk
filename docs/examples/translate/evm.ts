import { TranslateEVM } from "../../../src/translate/translateEVM";
import { ChainNotFoundError } from "../../../src/errors/ChainNotFoundError";
import { TransactionError } from "../../../src/errors/TransactionError";
import { HistoryData } from "../../../src/types/types";

/**
 * Example demonstrating the usage of the EVM Translate API
 */
async function evmTranslateExample() {
  // Initialize the EVM translator
  const evmTranslate = new TranslateEVM("YOUR_API_KEY");

  try {
    // 1. Get supported chains
    console.log("Fetching supported chains...");
    const chains = await evmTranslate.getChains();
    console.log("Supported chains:", chains);

    // 2. Get token balances for an account
    const accountAddress = "0x1234567890123456789012345678901234567890";
    console.log("\nFetching token balances...");
    
    // Get all token balances
    const allBalances = await evmTranslate.getTokenBalances("eth", accountAddress);
    console.log("All token balances:", allBalances);

    // Get balances for specific tokens
    const specificTokens = [
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
      "0xdac17f958d2ee523a2206206994597c13d831ec7"  // USDT
    ];
    const specificBalances = await evmTranslate.getTokenBalances("eth", accountAddress, specificTokens);
    console.log("Specific token balances:", specificBalances);

    // Get historical balances at a specific block
    const historicalBalances = await evmTranslate.getTokenBalances(
      "eth",
      accountAddress,
      undefined,
      12345678
    );
    console.log("Historical token balances:", historicalBalances);

    // Get balances with custom parameters
    const customBalances = await evmTranslate.getTokenBalances(
      "eth",
      accountAddress,
      undefined,
      undefined,
      true,  // includePrices
      false, // excludeZeroPrices
      true   // excludeSpam
    );
    console.log("Custom parameter balances:", customBalances);

    // 3. Get transaction history with pagination
    console.log("\nFetching transaction history...");
    const transactionsPage = await evmTranslate.History(
      "eth",
      accountAddress,
      { 
        pageSize: 5,
        startBlock: 14637919,
        endBlock: 15289488,
        sort: 'desc',
        liveData: false,
        viewAsTransactionSender: false
      }
    );

    // Process transactions
    let count = 0;
    let currentTransactions = transactionsPage.getTransactions() as HistoryData[];
    
    // Process current page
    console.log("\nProcessing current page transactions:");
    currentTransactions.forEach(tx => {
      console.log(`Transaction: ${tx.transactionHash}`);
      console.log(`Block: ${tx.blockNumber}`);
      console.log(`Timestamp: ${new Date(tx.timestamp * 1000).toISOString()}`);
      console.log('---');
      count++;
    });

    // Process subsequent pages
    while (await transactionsPage.next()) {
      currentTransactions = transactionsPage.getTransactions() as HistoryData[];
      console.log(`\nProcessing page ${transactionsPage.getPageKeys().length}:`);
      currentTransactions.forEach(tx => {
        console.log(`Transaction: ${tx.transactionHash}`);
        console.log(`Block: ${tx.blockNumber}`);
        console.log(`Timestamp: ${new Date(tx.timestamp * 1000).toISOString()}`);
        console.log('---');
        count++;
      });
    }

    console.log(`\nTotal transactions processed: ${count}`);

    // 4. Get available transaction types
    console.log("\nFetching available transaction types...");
    const txTypes = await evmTranslate.getTxTypes();
    console.log("Available transaction types:", txTypes.transactionTypes.map(type => ({
      type: type.type,
      description: type.description
    })));
    console.log("Transaction types version:", txTypes.version);

    // 5. Start a transaction job
    console.log("\nStarting transaction job...");
    const job = await evmTranslate.startTransactionJob(
      "eth",
      accountAddress,
      14637919,
      15289488,
      false,
      true
    );
    console.log("Job started:", job);

    // 6. Get job results
    if (job.jobId) {
      console.log("\nFetching job results...");
      const results = await evmTranslate.getTransactionJobResults("eth", job.jobId);
      console.log("Job results:", results);

      // Delete the job after we're done with it
      console.log("\nDeleting transaction job...");
      await evmTranslate.deleteTransactionJob("eth", job.jobId);
      console.log("Job deleted successfully");
    }

    // 7. Get detailed transaction information
    const txHash = "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22";
    console.log("\nFetching transaction details...");
    const txDetails = await evmTranslate.getTransaction("eth", txHash);
    console.log("Transaction details:", {
      txTypeVersion: txDetails.txTypeVersion,
      chain: txDetails.chain,
      accountAddress: txDetails.accountAddress,
      classificationData: {
        type: txDetails.classificationData.type,
        description: txDetails.classificationData.description,
        protocol: txDetails.classificationData.protocol
      },
      rawTransactionData: {
        transactionHash: txDetails.rawTransactionData.transactionHash,
        fromAddress: txDetails.rawTransactionData.fromAddress,
        toAddress: txDetails.rawTransactionData.toAddress,
        blockNumber: txDetails.rawTransactionData.blockNumber,
        gas: txDetails.rawTransactionData.gas,
        gasUsed: txDetails.rawTransactionData.gasUsed,
        gasPrice: txDetails.rawTransactionData.gasPrice,
        transactionFee: txDetails.rawTransactionData.transactionFee,
        timestamp: txDetails.rawTransactionData.timestamp
      }
    });

    // 8. Get transaction descriptions for multiple transactions
    console.log("\nFetching descriptions for multiple transactions...");
    const txHashes = [
      "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22",
      "0x2cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa23"
    ];
    const txDescriptions = await evmTranslate.describeTransactions("eth", txHashes);
    console.log("Transaction descriptions:", txDescriptions);

    // 9. Get raw transaction data
    console.log("\nFetching raw transaction data...");
    const rawTx = await evmTranslate.getRawTransaction("eth", txHash);
    console.log("Raw transaction data:", {
      network: rawTx.network,
      transactionHash: rawTx.rawTx.transactionHash,
      blockNumber: rawTx.rawTx.blockNumber,
      from: rawTx.rawTx.from,
      to: rawTx.rawTx.to,
      value: rawTx.rawTx.value,
      gasUsed: rawTx.rawTx.gasUsed,
      eventLogs: rawTx.eventLogs.map(log => ({
        name: log.decodedName,
        address: log.address,
        params: log.params
      }))
    });

  } catch (error) {
    if (error instanceof ChainNotFoundError) {
      console.error('Chain not found:', error.message);
    } else if (error instanceof TransactionError) {
      console.error('Transaction error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example demonstrating error handling with the EVM Translate API
 */
async function evmErrorHandlingExample() {
  const evmTranslate = new TranslateEVM("YOUR_API_KEY");

  // Example 1: Invalid chain
  try {
    await evmTranslate.getChains();
  } catch (error) {
    if (error instanceof ChainNotFoundError) {
      console.error("Invalid chain error:", error.message);
    }
  }

  // Example 2: Invalid transaction hash
  try {
    await evmTranslate.getTransaction("eth", "invalid-tx-hash");
  } catch (error) {
    if (error instanceof TransactionError) {
      console.error("Transaction error:", error.message);
    }
  }
}

// Run the examples
async function main() {
  console.log("=== Basic EVM Translate Example ===");
  await evmTranslateExample();

  console.log("\n=== EVM Error Handling Example ===");
  await evmErrorHandlingExample();
}

main().catch(console.error); 