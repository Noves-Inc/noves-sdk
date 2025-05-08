import { TranslateCOSMOS } from "../../../src/translate/translateCOSMOS";
import { CosmosAddressError, CosmosTransactionJobError } from "../../../src/errors/CosmosError";

/**
 * Example demonstrating the usage of the Cosmos Translate API
 */
async function cosmosTranslateExample() {
  // Initialize the Cosmos translator
  const cosmosTranslate = new TranslateCOSMOS("YOUR_API_KEY");

  try {
    // 1. Get supported chains
    console.log("Fetching supported chains...");
    const chains = await cosmosTranslate.getChains();
    console.log("Supported chains:", chains);

    // 2. Get token balances for an account
    const accountAddress = "cosmos1abcdefghijklmnopqrstuvwxyz1234567890";
    console.log("\nFetching token balances...");
    const balances = await cosmosTranslate.getTokenBalances("cosmoshub", accountAddress);
    console.log("Token balances:", balances);

    // 3. Get transaction history with pagination
    console.log("\nFetching transaction history...");
    const transactionsPage = await cosmosTranslate.Transactions(
      "cosmoshub",
      accountAddress,
      { pageSize: 5 }
    );

    // Process transactions
    let count = 0;
    let currentTransactions = transactionsPage.getTransactions();
    
    // Process current page
    for (const tx of currentTransactions) {
      console.log(`Transaction ${++count}:`, {
        hash: tx.rawTransactionData.transactionHash,
        timestamp: tx.rawTransactionData.timestamp,
        type: tx.classificationData.type,
        description: tx.classificationData.description
      });
    }

    // Process next pages if available
    while (await transactionsPage.next()) {
      currentTransactions = transactionsPage.getTransactions();
      for (const tx of currentTransactions) {
        console.log(`Transaction ${++count}:`, {
          hash: tx.rawTransactionData.transactionHash,
          timestamp: tx.rawTransactionData.timestamp,
          type: tx.classificationData.type,
          description: tx.classificationData.description
        });
      }
    }

    // 4. Start a transaction job
    console.log("\nStarting transaction job...");
    const job = await cosmosTranslate.startTransactionJob("cosmoshub", accountAddress);
    console.log("Job started:", job);

    // 5. Get job results
    if (job.pageId) {
      console.log("\nFetching job results...");
      const results = await cosmosTranslate.getTransactionJobResults("cosmoshub", job.pageId);
      console.log("Job results:", results);
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Example demonstrating error handling with the Cosmos Translate API
 */
async function cosmosErrorHandlingExample() {
  const cosmosTranslate = new TranslateCOSMOS("YOUR_API_KEY");

  // Example 1: Invalid address
  try {
    await cosmosTranslate.getTokenBalances("cosmoshub", "invalid-address");
  } catch (error) {
    if (error instanceof CosmosAddressError) {
      console.error("Invalid address error:", error.message);
    }
  }

  // Example 2: Transaction job error
  try {
    const job = await cosmosTranslate.startTransactionJob("cosmoshub", "valid-address");
    if (job.status === 'failed') {
      throw new CosmosTransactionJobError(job.jobId, job.status);
    }
  } catch (error) {
    if (error instanceof CosmosTransactionJobError) {
      console.error("Transaction job error:", error.message);
    }
  }
}

/**
 * Example demonstrating advanced usage of the Cosmos Translate API
 */
async function cosmosAdvancedExample() {
  const cosmosTranslate = new TranslateCOSMOS("YOUR_API_KEY");
  const accountAddress = "cosmos1abcdefghijklmnopqrstuvwxyz1234567890";

  try {
    // 1. Monitor token balances
    console.log("Monitoring token balances...");
    const initialBalances = await cosmosTranslate.getTokenBalances("cosmoshub", accountAddress);
    console.log("Initial balances:", initialBalances);

    // 2. Get detailed transaction information
    const txHash = "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22";
    console.log("\nFetching transaction details...");
    const txDetails = await cosmosTranslate.getTransaction("cosmoshub", txHash);
    console.log("Transaction details:", txDetails);

    // 3. Process paginated transactions with error handling
    console.log("\nProcessing paginated transactions...");
    const transactionsPage = await cosmosTranslate.Transactions(
      "cosmoshub",
      accountAddress,
      { pageSize: 10 }
    );

    // Process current page
    let currentTransactions = transactionsPage.getTransactions();
    for (const tx of currentTransactions) {
      try {
        // Process each transaction
        console.log("Processing transaction:", tx.rawTransactionData.transactionHash);
        // Add your custom processing logic here
      } catch (error) {
        console.error(`Error processing transaction ${tx.rawTransactionData.transactionHash}:`, error);
        // Continue with next transaction
        continue;
      }
    }

    // Process next pages if available
    while (await transactionsPage.next()) {
      currentTransactions = transactionsPage.getTransactions();
      for (const tx of currentTransactions) {
        try {
          // Process each transaction
          console.log("Processing transaction:", tx.rawTransactionData.transactionHash);
          // Add your custom processing logic here
        } catch (error) {
          console.error(`Error processing transaction ${tx.rawTransactionData.transactionHash}:`, error);
          // Continue with next transaction
          continue;
        }
      }
    }

  } catch (error) {
    console.error("Error in advanced example:", error);
  }
}

// Run the examples
async function main() {
  console.log("=== Basic Cosmos Translate Example ===");
  await cosmosTranslateExample();

  console.log("\n=== Cosmos Error Handling Example ===");
  await cosmosErrorHandlingExample();

  console.log("\n=== Advanced Cosmos Example ===");
  await cosmosAdvancedExample();
}

main().catch(console.error); 