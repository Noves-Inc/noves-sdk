import { TranslateTVM } from "../../../src/translate/translateTVM";
import { TransactionsPage } from "../../../src/index";

/**
 * Example demonstrating the usage of the TVM Translate API
 */
async function tvmTranslateExample() {
  // Initialize the TVM translator
  const tvmTranslate = new TranslateTVM("YOUR_API_KEY");

  try {
    // 1. Get supported chains
    console.log("Fetching supported chains...");
    const chains = await tvmTranslate.getChains();
    console.log("Supported chains:", chains);

    // 2. Get transaction history with pagination
    const accountAddress = "TD7beBofzDoDZ7qcGUAeHK1zf2Fnsvz2SP";
    console.log("\nFetching transaction history...");
    const transactionsPage = await tvmTranslate.getTransactions(
      "tron",
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

    // 3. Demonstrate advanced pagination navigation
    console.log("\nDemonstrating pagination navigation...");
    console.log("Has next page:", !!transactionsPage.getNextPageKeys());
    console.log("Has previous page:", transactionsPage.hasPrevious());
    
    if (transactionsPage.getNextPageKeys()) {
      console.log("\nFetching next page...");
      const hasNextPage = await transactionsPage.next();
      
      if (hasNextPage) {
        const nextTransactions = transactionsPage.getTransactions();
        console.log("Next page has", nextTransactions.length, "transactions");
        console.log("Has previous page now:", transactionsPage.hasPrevious());
        
        for (const tx of nextTransactions) {
          console.log(`Transaction ${++count}:`, {
            hash: tx.rawTransactionData.transactionHash,
            timestamp: tx.rawTransactionData.timestamp,
            type: tx.classificationData.type,
            description: tx.classificationData.description
          });
        }
        
        // Go back to previous page
        if (transactionsPage.hasPrevious()) {
          console.log("\nGoing back to previous page...");
          await transactionsPage.previous();
          const previousTransactions = transactionsPage.getTransactions();
          console.log("Back to previous page with", previousTransactions.length, "transactions");
          console.log("Has previous page after going back:", transactionsPage.hasPrevious());
        }
      }
    }

    // 4. Advanced cursor-based pagination examples
    console.log("\n=== Cursor-Based Pagination Examples ===");
    
    // Get a fresh transactions page to demonstrate cursor features
    const cursorTransactionsPage = await tvmTranslate.getTransactions("tron", accountAddress, {
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
        tvmTranslate,
        "tron",
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

  } catch (error) {
    console.error("Error:", error);
  }
}

export { tvmTranslateExample }; 