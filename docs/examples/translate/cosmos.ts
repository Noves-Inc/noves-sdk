import { TranslateCOSMOS } from "../../../src/translate/translateCOSMOS";
import { CosmosTransactionJobError } from "../../../src/errors/CosmosError";
import { TransactionError } from "../../../src/errors/TransactionError";
import { TransactionsPage } from "../../../src/index";

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

    // 3. Get transactions with pagination
    console.log("\nFetching transactions with pagination...");
    const transactionsPage = await cosmosTranslate.getTransactions(
      "cosmoshub",
      accountAddress,
      { pageSize: 5 }
    );

    // Get current page transactions
    let transactions = transactionsPage.getTransactions();
    console.log("First page transactions:", transactions.length);
    console.log("Has next page:", !!transactionsPage.getNextPageKeys());

    // Process current page transactions
    transactions.forEach((tx, index) => {
      console.log(`Transaction ${index + 1}:`, {
        hash: tx.rawTransactionData.txhash || "Genesis transaction (no hash)",
        timestamp: tx.rawTransactionData.timestamp,
        type: tx.classificationData.type,
        description: tx.classificationData.description,
        height: tx.rawTransactionData.height,
        gasUsed: tx.rawTransactionData.gas_used
      });
    });

    // Navigate through pages
    if (transactionsPage.getNextPageKeys()) {
      console.log("\nFetching next page...");
      await transactionsPage.next();
      
      const nextPageTransactions = transactionsPage.getTransactions();
      console.log("Second page transactions:", nextPageTransactions.length);
      
      // Go back to first page
      if (transactionsPage.hasPrevious()) {
        console.log("\nGoing back to first page...");
        await transactionsPage.previous();
        console.log("Back to first page transactions:", transactionsPage.getTransactions().length);
      }
    }

    // 4. Process all transactions using iterator
    console.log("\nProcessing all transactions using iterator...");
    let count = 0;
    for await (const tx of transactionsPage) {
      console.log(`Transaction ${++count}:`, {
        hash: tx.rawTransactionData.txhash || "Genesis transaction (no hash)",
        timestamp: tx.rawTransactionData.timestamp,
        type: tx.classificationData.type,
        description: tx.classificationData.description,
        height: tx.rawTransactionData.height,
        gasUsed: tx.rawTransactionData.gas_used
      });
    }

    // 5. Advanced cursor-based pagination examples
    console.log("\n=== Cursor-Based Pagination Examples ===");
    
    // Get a fresh transactions page to demonstrate cursor features
    const cursorTransactionsPage = await cosmosTranslate.getTransactions("cosmoshub", accountAddress, {
      pageSize: 3
    });

    // Get cursor information
    const cursorInfo = cursorTransactionsPage.getCursorInfo();
    console.log("Cursor Info:", cursorInfo);

    // Extract individual cursors
    const nextCursor = cursorTransactionsPage.getNextCursor();
    const previousCursor = cursorTransactionsPage.getPreviousCursor();
    
    console.log("Next cursor:", nextCursor);
    console.log("Previous cursor:", previousCursor);

    // Demonstrate creating a page from a cursor
    if (nextCursor) {
      console.log("\nCreating new page from next cursor...");
      const pageFromCursor = await TransactionsPage.fromCursor(
        cosmosTranslate,
        "cosmoshub",
        accountAddress,
        nextCursor
      );
      
      console.log("Page from cursor has:", pageFromCursor.getTransactions().length, "transactions");
      console.log("Page from cursor info:", pageFromCursor.getCursorInfo());
    }

    // Demonstrate cursor decoding
    if (nextCursor) {
      console.log("\nDecoding cursor to see page options...");
      const decodedPageOptions = TransactionsPage.decodeCursor(nextCursor);
      console.log("Decoded cursor:", decodedPageOptions);
    }

    // Example: Building a GraphQL-style pagination interface
    console.log("\n=== Custom Pagination Interface Example ===");
    
    async function getTransactionsWithCustomPagination(
      chain: string, 
      address: string, 
      cursor?: string, 
      pageSize: number = 3
    ) {
      let transactionsPage;
      
      if (cursor) {
        // Resume from cursor
        transactionsPage = await TransactionsPage.fromCursor(
          cosmosTranslate, 
          chain, 
          address, 
          cursor
        );
      } else {
        // Start from beginning
        transactionsPage = await cosmosTranslate.getTransactions(chain, address, {
          pageSize
        });
      }
      
      const cursorInfo = transactionsPage.getCursorInfo();
      
      return {
        transactions: transactionsPage.getTransactions(),
        pageInfo: {
          hasNextPage: cursorInfo.hasNextPage,
          hasPreviousPage: cursorInfo.hasPreviousPage,
          startCursor: cursor || null,
          endCursor: cursorInfo.nextCursor
        }
      };
    }

    // Use the custom pagination interface
    console.log("Getting first page with custom interface...");
    const customPage1 = await getTransactionsWithCustomPagination("cosmoshub", accountAddress);
    console.log("Custom page 1:", {
      transactionCount: customPage1.transactions.length,
      pageInfo: customPage1.pageInfo
    });

    if (customPage1.pageInfo.endCursor) {
      console.log("Getting second page with custom interface...");
      const customPage2 = await getTransactionsWithCustomPagination(
        "cosmoshub", 
        accountAddress, 
        customPage1.pageInfo.endCursor
      );
      console.log("Custom page 2:", {
        transactionCount: customPage2.transactions.length,
        pageInfo: customPage2.pageInfo
      });
    }

    // 6. Start a transaction job
    console.log("\nStarting transaction job...");
    const job = await cosmosTranslate.startTransactionJob("cosmoshub", accountAddress);
    console.log("Job started:", job);

    // 6. Get job results
    if (job.nextPageId) {
      console.log("\nFetching job results...");
      const results = await cosmosTranslate.getTransactionJobResults("cosmoshub", job.nextPageId);
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
    console.log("Job started successfully:", job.nextPageId);
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
    const transactionsPage = await cosmosTranslate.getTransactions(
      "cosmoshub",
      accountAddress,
      { pageSize: 10 }
    );

    // Process transactions with proper null handling
    const transactions = transactionsPage.getTransactions();
    for (let index = 0; index < transactions.length; index++) {
      const tx = transactions[index];
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

    // 4. Process paginated transactions with error handling
    console.log("\nProcessing paginated transactions...");
    const paginatedTransactions = await cosmosTranslate.getTransactions(
      "cosmoshub",
      accountAddress,
      { pageSize: 10 }
    );

    // Process current page
    let currentTransactions = paginatedTransactions.getTransactions();
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