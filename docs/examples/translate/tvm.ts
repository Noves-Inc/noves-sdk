import { TranslateTVM } from "../../../src/translate/translateTVM";

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

    // 3. Get next page if available
    if (transactionsPage.getNextPageKeys()) {
      console.log("\nFetching next page...");
      const hasNextPage = await transactionsPage.next();
      
      if (hasNextPage) {
        const nextTransactions = transactionsPage.getTransactions();
        for (const tx of nextTransactions) {
          console.log(`Transaction ${++count}:`, {
            hash: tx.rawTransactionData.transactionHash,
            timestamp: tx.rawTransactionData.timestamp,
            type: tx.classificationData.type,
            description: tx.classificationData.description
          });
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export { tvmTranslateExample }; 