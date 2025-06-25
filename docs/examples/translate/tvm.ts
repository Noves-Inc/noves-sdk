import { TranslateTVM } from "../../../src/translate/translateTVM";
import { TransactionsPage } from "../../../src/index";
import { TVMTranslateTransactionV5, TVMTranslateTransactionV2 } from "../../../src/types/tvm";

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

    // 2. Get transaction details in different formats
    const txHash = "3c74d7fedca0cc50f80d472233d990449d10190de1e80c9098168d721f6aa2b8";
    
    // Get transaction in v5 format (default)
    console.log("\nFetching transaction in v5 format...");
    const txV5 = await tvmTranslate.getTransaction("tron", txHash, "v5");
    
    // Type narrowing for v5 format
    if (txV5.txTypeVersion === 5) {
      const v5Transaction = txV5 as TVMTranslateTransactionV5;
      console.log("V5 Transaction:", {
        version: v5Transaction.txTypeVersion,
        type: v5Transaction.classificationData.type,
        description: v5Transaction.classificationData.description,
        timestamp: v5Transaction.timestamp,
        transfersCount: v5Transaction.transfers.length,
        valuesCount: v5Transaction.values.length
      });
    } else {
      console.log("V5 Transaction (fallback):", {
        version: txV5.txTypeVersion,
        type: txV5.classificationData.type,
        description: txV5.classificationData.description,
        timestamp: txV5.rawTransactionData.timestamp
      });
    }

    // Process transfers in v5 format
    if (txV5.txTypeVersion === 5) {
      const v5Tx = txV5 as TVMTranslateTransactionV5;
      console.log("V5 Transfers:");
      v5Tx.transfers.forEach((transfer, index) => {
        console.log(`  Transfer ${index + 1}:`, {
          action: transfer.action,
          amount: transfer.amount,
          token: transfer.token.symbol,
          from: transfer.from.address,
          to: transfer.to.address
        });
      });
    }

    // Get transaction in v2 format (legacy)
    console.log("\nFetching transaction in v2 format...");
    const txV2 = await tvmTranslate.getTransaction("tron", txHash, "v2");
    
    // Type narrowing for v2 format
    if (txV2.txTypeVersion === 2) {
      const v2Transaction = txV2 as TVMTranslateTransactionV2;
      console.log("V2 Transaction:", {
        version: v2Transaction.txTypeVersion,
        type: v2Transaction.classificationData.type,
        description: v2Transaction.classificationData.description,
        timestamp: v2Transaction.rawTransactionData.timestamp, // Timestamp in rawTransactionData for v2
        sentCount: v2Transaction.classificationData.sent.length,
        receivedCount: v2Transaction.classificationData.received.length
      });
    } else {
      console.log("V2 Transaction (fallback):", {
        version: txV2.txTypeVersion,
        type: txV2.classificationData.type,
        description: txV2.classificationData.description,
        timestamp: txV2.rawTransactionData.timestamp
      });
    }

    // Process sent/received in v2 format
    if (txV2.txTypeVersion === 2) {
      const v2Tx = txV2 as TVMTranslateTransactionV2;
      console.log("V2 Sent transfers:");
      v2Tx.classificationData.sent.forEach((transfer, index) => {
        console.log(`  Sent ${index + 1}:`, {
          action: transfer.action,
          amount: transfer.amount,
          token: transfer.token.symbol,
          from: transfer.from.address,
          to: transfer.to.address
        });
      });
      
      console.log("V2 Received transfers:");
      v2Tx.classificationData.received.forEach((transfer, index) => {
        console.log(`  Received ${index + 1}:`, {
          action: transfer.action,
          amount: transfer.amount,
          token: transfer.token.symbol,
          from: transfer.from.address,
          to: transfer.to.address
        });
      });
    }

    // 3. Get transaction history with pagination
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

    // 4. Demonstrate advanced pagination navigation
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

    // 5. Advanced cursor-based pagination examples
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

    // 6. Balance Job Examples
    console.log("\n=== Balance Job Examples ===");
    
    // Start a balance job
    const tokenAddress = "TXL6rJbvmjD46zeN1JssfgxvSo99qC8MRT"; // SUNDOG token
    const balanceAccountAddress = "TH2uNFtnwr5NsiAW2Py6Fmv8zDhfYXyDd9";
    const blockNumber = 73196764;
    
    console.log("Starting balance job...");
    const jobResponse = await tvmTranslate.startBalancesJob(
      "tron",
      tokenAddress,
      balanceAccountAddress,
      blockNumber
    );
    
    console.log("Job started:", {
      jobId: jobResponse.jobId,
      resultUrl: jobResponse.resultUrl
    });

    // Poll for results with retry logic
    console.log("Polling for balance results...");
    async function pollForBalance(chain: string, jobId: string, maxRetries = 10, delayMs = 2000) {
      for (let i = 0; i < maxRetries; i++) {
        try {
          const result = await tvmTranslate.getBalancesJobResults(chain, jobId);
          console.log("Balance result obtained:", result);
          return result;
        } catch (error: any) {
          if (error.status === 425 && i < maxRetries - 1) {
            console.log(`Job still processing, retrying in ${delayMs}ms... (attempt ${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          } else {
            console.error("Error getting balance results:", error);
            throw error;
          }
        }
      }
      throw new Error("Max retries exceeded");
    }

    // Get the balance result
    const balanceResult = await pollForBalance("tron", jobResponse.jobId);
    console.log(`\nFinal Balance: ${balanceResult.amount} ${balanceResult.token.symbol}`);
    console.log("Token details:", balanceResult.token);
    console.log(`Balance calculated at block: ${balanceResult.blockNumber}`);

  } catch (error) {
    console.error("Error:", error);
  }
}

export { tvmTranslateExample }; 