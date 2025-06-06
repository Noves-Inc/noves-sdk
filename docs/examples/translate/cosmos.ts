import { TranslateCOSMOS } from "../../../src/translate/translateCOSMOS";
import { CosmosTransactionJobError } from "../../../src/errors/CosmosError";
import { TransactionError } from "../../../src/errors/TransactionError";

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

    // 3. Get transactions directly (recommended approach)
    console.log("\nFetching transactions directly...");
    const response = await cosmosTranslate.getTransactions(
      "cosmoshub",
      accountAddress,
      { pageSize: 5 }
    );

    console.log("Account:", response.account);
    console.log("Page size:", response.pageSize);
    console.log("Has next page:", response.hasNextPage);
    console.log("Total transactions in this page:", response.items.length);

    // Process transactions
    response.items.forEach((tx, index) => {
      console.log(`Transaction ${index + 1}:`, {
        hash: tx.rawTransactionData.txhash || "Genesis transaction (no hash)",
        timestamp: tx.rawTransactionData.timestamp,
        type: tx.classificationData.type,
        description: tx.classificationData.description,
        height: tx.rawTransactionData.height,
        gasUsed: tx.rawTransactionData.gas_used
      });
    });

    // 4. Get transaction history with pagination (legacy method)
    console.log("\nFetching transaction history with pagination...");
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
        hash: tx.rawTransactionData.txhash || "Genesis transaction (no hash)",
        timestamp: tx.rawTransactionData.timestamp,
        type: tx.classificationData.type,
        description: tx.classificationData.description,
        height: tx.rawTransactionData.height,
        gasUsed: tx.rawTransactionData.gas_used
      });
    }

    // Process next pages if available
    while (await transactionsPage.next()) {
      currentTransactions = transactionsPage.getTransactions();
      for (const tx of currentTransactions) {
        console.log(`Transaction ${++count}:`, {
          hash: tx.rawTransactionData.txhash || "Genesis transaction (no hash)",
          timestamp: tx.rawTransactionData.timestamp,
          type: tx.classificationData.type,
          description: tx.classificationData.description,
          height: tx.rawTransactionData.height,
          gasUsed: tx.rawTransactionData.gas_used
        });
      }
    }

    // 5. Start a transaction job
    console.log("\nStarting transaction job...");
    const job = await cosmosTranslate.startTransactionJob("cosmoshub", accountAddress);
    console.log("Job started:", job);

    // 6. Get job results
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

  // Example 1: API error handling
  try {
    await cosmosTranslate.getTokenBalances("cosmoshub", "invalid-address");
  } catch (error) {
    if (error instanceof TransactionError) {
      console.error("Transaction error:", error.message);
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

    // 3. Process transactions with proper null handling
    console.log("\nProcessing transactions with null handling...");
    const response = await cosmosTranslate.getTransactions(
      "cosmoshub",
      accountAddress,
      { pageSize: 10 }
    );

    // Process transactions with proper null handling
    for (let index = 0; index < response.items.length; index++) {
      const tx = response.items[index];
      try {
        // Handle nullable txhash properly
        const txHash = tx.rawTransactionData.txhash;
        if (txHash) {
          console.log(`Processing transaction ${index + 1} with hash: ${txHash}`);
        } else {
          console.log(`Processing genesis transaction ${index + 1} (no hash)`);
        }
        
        // Process transfers
        tx.transfers.forEach((transfer, transferIndex) => {
          console.log(`  Transfer ${transferIndex + 1}:`, {
            action: transfer.action,
            amount: transfer.amount,
            asset: transfer.asset.symbol,
            from: transfer.from.address || "Unknown",
            to: transfer.to.address || "Unknown"
          });
        });
        
        // Add your custom processing logic here
      } catch (error) {
        const txHash = tx.rawTransactionData.txhash || "genesis";
        console.error(`Error processing transaction ${txHash}:`, error);
        // Continue with next transaction
        continue;
      }
    }

    // 4. Process paginated transactions with error handling (legacy method)
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
        // Process each transaction with null handling
        const txHash = tx.rawTransactionData.txhash;
        if (txHash) {
          console.log("Processing transaction:", txHash);
        } else {
          console.log("Processing genesis transaction (no hash)");
        }
        // Add your custom processing logic here
      } catch (error) {
        const txHash = tx.rawTransactionData.txhash || "genesis";
        console.error(`Error processing transaction ${txHash}:`, error);
        // Continue with next transaction
        continue;
      }
    }

    // Process next pages if available
    while (await transactionsPage.next()) {
      currentTransactions = transactionsPage.getTransactions();
      for (const tx of currentTransactions) {
        try {
          // Process each transaction with null handling
          const txHash = tx.rawTransactionData.txhash;
          if (txHash) {
            console.log("Processing transaction:", txHash);
          } else {
            console.log("Processing genesis transaction (no hash)");
          }
          // Add your custom processing logic here
        } catch (error) {
          const txHash = tx.rawTransactionData.txhash || "genesis";
          console.error(`Error processing transaction ${txHash}:`, error);
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