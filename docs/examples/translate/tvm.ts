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
    const transactionsPage = await tvmTranslate.Transactions(
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

    // 3. Get transaction status
    const txHash = currentTransactions[0]?.rawTransactionData.transactionHash;
    if (txHash) {
      console.log("\nFetching transaction status...");
      const txStatus = await tvmTranslate.getTransactionStatus("tron", txHash);
      console.log("Transaction status:", txStatus);
    }

    // 4. Start a balances job
    console.log("\nStarting balances job...");
    const job = await tvmTranslate.startBalancesJob(
      "tron",
      "TD7beBofzDoDZ7qcGUAeHK1zf2Fnsvz2SP",
      "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
      72049264
    );
    console.log("Job started:", job);

    // 5. Get job results
    if (job.jobId) {
      console.log("\nFetching job results...");
      const results = await tvmTranslate.getBalancesJobResults("tron", job.jobId);
      console.log("Job results:", results);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export { tvmTranslateExample }; 