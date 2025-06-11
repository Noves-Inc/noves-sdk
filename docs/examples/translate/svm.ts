import { TranslateSVM } from "../../../src/translate/translateSVM";
import { ChainNotFoundError } from "../../../src/errors/ChainNotFoundError";
import { TransactionError } from "../../../src/errors/TransactionError";
import { TransactionsPage } from "../../../src/index";

/**
 * Example demonstrating the usage of the Solana (SVM) Translate API
 */
async function solanaTranslateExample() {
  // Initialize the Solana translator
  const solanaTranslate = new TranslateSVM("YOUR_API_KEY");

  try {
    // 1. Get supported chains
    console.log("Fetching supported chains...");
    const chains = await solanaTranslate.getChains();
    console.log("Supported chains:", chains);

    // 2. Get transaction types
    console.log("\nFetching transaction types...");
    const txTypes = await solanaTranslate.getTxTypes();
    console.log("Transaction types:", txTypes);

    // 3. Get transactions for an account
    const accountAddress = "2w31NPGGZ7U2MCd3igujKeG7hggYNzsvknNeotQYJ1FF";
    console.log("\nFetching transactions...");
    
    // Get transactions with pagination
    const transactions = await solanaTranslate.Transactions(
      "solana",
      accountAddress,
      { pageSize: 10 }
    );

    // Process transactions
    for await (const tx of transactions) {
      console.log("Transaction:", {
        type: tx.classificationData.type,
        timestamp: new Date(tx.timestamp * 1000).toISOString(),
        transfers: tx.transfers.map(t => ({
          action: t.action,
          amount: t.amount,
          token: t.token.symbol,
          from: t.from.address,
          to: t.to.address
        })),
        rawData: {
          signature: tx.rawTransactionData.signature,
          blockNumber: tx.rawTransactionData.blockNumber,
          signer: tx.rawTransactionData.signer,
          interactedAccounts: tx.rawTransactionData.interactedAccounts
        }
      });
    }

    // 3b. Get transactions using the new getTransactions method with advanced pagination
    console.log("\nFetching transactions using getTransactions with pagination...");
    const transactionsPage = await solanaTranslate.getTransactions(
      "solana",
      accountAddress,
      { 
        pageSize: 5,
        v5Format: true,
        sort: 'desc'
      }
    );

    // Process current page
    const currentTransactions = transactionsPage.getTransactions();
    console.log("Current page transactions:", currentTransactions.length);
    console.log("Has next page:", !!transactionsPage.getNextPageKeys());
    console.log("Has previous page:", transactionsPage.hasPrevious());

    // Show first transaction details
    if (currentTransactions.length > 0) {
      const firstTx = currentTransactions[0];
      console.log("First transaction details:", {
        type: firstTx.classificationData.type,
        description: firstTx.txTypeVersion === 5 ? firstTx.classificationData.description : 'N/A (v4 format)',
        signature: firstTx.rawTransactionData.signature,
        transfers: firstTx.transfers.length
      });
    }

    // Demonstrate pagination navigation
    if (transactionsPage.getNextPageKeys()) {
      console.log("\nNavigating to next page...");
      await transactionsPage.next();
      const nextPageTransactions = transactionsPage.getTransactions();
      console.log("Next page transactions:", nextPageTransactions.length);
      console.log("Has previous page now:", transactionsPage.hasPrevious());
      
      // Go back to previous page
      if (transactionsPage.hasPrevious()) {
        console.log("Going back to previous page...");
        await transactionsPage.previous();
        const backToFirstPage = transactionsPage.getTransactions();
        console.log("Back to first page transactions:", backToFirstPage.length);
        console.log("Has previous page after going back:", transactionsPage.hasPrevious());
      }
    }

    // 4. Advanced cursor-based pagination examples
    console.log("\n=== Cursor-Based Pagination Examples ===");
    
    // Get a fresh transactions page to demonstrate cursor features
    const cursorTransactionsPage = await solanaTranslate.getTransactions("solana", accountAddress, {
      pageSize: 3,
      v5Format: true
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
        solanaTranslate,
        "solana",
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
          solanaTranslate, 
          chain, 
          address, 
          cursor
        );
      } else {
        // Start from beginning
        transactionsPage = await solanaTranslate.getTransactions(chain, address, {
          pageSize,
          v5Format: true
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
    const customPage1 = await getTransactionsWithCustomPagination("solana", accountAddress);
    console.log("Custom page 1:", {
      transactionCount: customPage1.transactions.length,
      pageInfo: customPage1.pageInfo
    });

    if (customPage1.pageInfo.endCursor) {
      console.log("Getting second page with custom interface...");
      const customPage2 = await getTransactionsWithCustomPagination(
        "solana", 
        accountAddress, 
        customPage1.pageInfo.endCursor
      );
      console.log("Custom page 2:", {
        transactionCount: customPage2.transactions.length,
        pageInfo: customPage2.pageInfo
      });
    }

    // 5. Get SPL token accounts
    console.log("\nFetching SPL token accounts...");
    const splTokens = await solanaTranslate.getSplTokens(accountAddress);
    console.log("Account public key:", splTokens.accountPubkey);
    console.log("Number of token accounts:", splTokens.tokenAccounts.length);
    console.log("Token accounts:", splTokens.tokenAccounts);

    // 5. Get specific transaction details
    console.log("\nFetching specific transaction...");
    const txSignature = "2ez7gUe9yvM9Hq9wT18tmT2H73k4txu3AFfDEejYeqviMRUxWVWPGtgR71W474FuNcpxV5GQRACvzvNJk5nzEiEL";
    try {
      // Get transaction in v5 format (default)
      const txInfo = await solanaTranslate.getTransaction("solana", txSignature);
      console.log("Transaction details (v5):", {
        txTypeVersion: txInfo.txTypeVersion,
        source: txInfo.source, // Can be null in v5
        type: txInfo.classificationData.type,
        ...(txInfo.txTypeVersion === 5 && {
          description: txInfo.classificationData.description, // Only in v5
          values: txInfo.values, // Only in v5
        }),
        timestamp: new Date(txInfo.timestamp * 1000).toISOString(),
        transfers: txInfo.transfers.map(t => ({
          action: t.action,
          amount: t.amount,
          token: t.token.symbol,
          from: t.from.address,
          to: t.to.address
        })),
        rawData: {
          signature: txInfo.rawTransactionData.signature,
          blockNumber: txInfo.rawTransactionData.blockNumber,
          signer: txInfo.rawTransactionData.signer,
          interactedAccounts: txInfo.rawTransactionData.interactedAccounts
        }
      });

      // Get transaction in v4 format
      const txInfoV4 = await solanaTranslate.getTransaction("solana", txSignature, 4);
      console.log("Transaction details (v4):", {
        txTypeVersion: txInfoV4.txTypeVersion,
        source: txInfoV4.source, // Always has type and name
        type: txInfoV4.classificationData.type,
        timestamp: new Date(txInfoV4.timestamp * 1000).toISOString(),
        transfers: txInfoV4.transfers.map(t => ({
          action: t.action,
          amount: t.amount,
          token: t.token.symbol,
          from: t.from.address,
          to: t.to.address
        })),
        rawData: {
          signature: txInfoV4.rawTransactionData.signature,
          blockNumber: txInfoV4.rawTransactionData.blockNumber,
          signer: txInfoV4.rawTransactionData.signer,
          interactedAccounts: txInfoV4.rawTransactionData.interactedAccounts
        }
      });
    } catch (error) {
      if (error instanceof TransactionError) {
        console.error("Transaction error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }

    // 6. Get staking transactions
    console.log("\nFetching staking transactions...");
    const stakingAccount = "6ZuLUCwVTvuQJrN1HrpoHJheQUw9Zk8CtiD3CEpHiA9E";
    const stakingTxs = await solanaTranslate.getStakingTransactions("solana", stakingAccount, { numberOfEpochs: 10 });
    console.log("Staking transactions:", {
      numberOfEpochs: stakingTxs.numberOfEpochs,
      failedEpochs: stakingTxs.failedEpochs,
      itemCount: stakingTxs.items.length,
      firstItem: stakingTxs.items[0] ? {
        type: stakingTxs.items[0].classificationData.type,
        description: stakingTxs.items[0].classificationData.description,
        timestamp: new Date(stakingTxs.items[0].timestamp * 1000).toISOString(),
        transfers: stakingTxs.items[0].transfers.map(t => ({
          action: t.action,
          amount: t.amount,
          token: t.token.symbol
        })),
        values: stakingTxs.items[0].values,
        signature: stakingTxs.items[0].rawTransactionData.signature
      } : null
    });

    // 7. Get staking epoch information
    console.log("\nFetching staking epoch information...");
    const epoch = 777;
    const stakingEpoch = await solanaTranslate.getStakingEpoch("solana", stakingAccount, epoch);
    console.log("Staking epoch info:", {
      txTypeVersion: stakingEpoch.txTypeVersion,
      timestamp: new Date(stakingEpoch.timestamp * 1000).toISOString(),
      type: stakingEpoch.classificationData.type,
      description: stakingEpoch.classificationData.description,
      transfers: stakingEpoch.transfers.map(t => ({
        action: t.action,
        amount: t.amount,
        token: t.token.symbol,
        from: t.from.name,
        to: t.to.address
      })),
      values: stakingEpoch.values,
      signature: stakingEpoch.rawTransactionData.signature,
      blockNumber: stakingEpoch.rawTransactionData.blockNumber
    });

    // 8. Start a transaction job
    console.log("\nStarting transaction job...");
    const job = await solanaTranslate.startTransactionJob(
      "solana",
      accountAddress,
      0,
      true
    );
    console.log("Job started:", job);

    // 9. Get job results
    if (job.jobId) {
      console.log("\nFetching job results...");
      const results = await solanaTranslate.getTransactionJobResults("solana", job.jobId);
      console.log("Job results:", results);

      // Delete the job after we're done with it
      console.log("\nDeleting transaction job...");
      const deleteResult = await solanaTranslate.deleteTransactionJob("solana", job.jobId);
      console.log("Job deleted:", deleteResult.message);
    }

    // Get token balances
    console.log("\nFetching token balances...");
    const balances = await solanaTranslate.getTokenBalances(
      'solana',
      'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'
    );
    console.log("Token balances:", balances.map(b => ({
      balance: b.balance,
      usdValue: b.usdValue,
      token: {
        symbol: b.token.symbol,
        name: b.token.name,
        decimals: b.token.decimals,
        address: b.token.address,
        price: b.token.price
      }
    })));

    // Get transaction count (uses job-based API internally)
    console.log("\nFetching transaction count...");
    const txCount = await solanaTranslate.getTransactionCount(
      'solana',
      'H6FTjrbVduVKWiMDDiyvyXYacK17apFajQwymchXfyDT'
    );
    console.log("Transaction count:", txCount.account.transactionCount);
    console.log("Chain:", txCount.chain);
    console.log("Account address:", txCount.account.address);
    console.log("Timestamp:", new Date(txCount.timestamp * 1000).toISOString());

    // Get transaction count with webhook notification
    console.log("\nFetching transaction count with webhook...");
    const txCountWithWebhook = await solanaTranslate.getTransactionCount(
      'solana',
      'CTefbX8zKWx73V4zWUZc32vJMShmnzJfvstZ8aMAo5Q2',
      'https://example.com/webhook'
    );
    console.log("Transaction count with webhook:", txCountWithWebhook.account.transactionCount);

    // Get token balances with custom parameters
    const customBalances = await solanaTranslate.getTokenBalances(
      'solana',
      'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
      false, // includePrices
      true   // excludeZeroPrices
    );
    console.log("Custom parameter balances:", customBalances);

  } catch (error) {
    if (error instanceof ChainNotFoundError) {
      console.error("Chain not found:", error.message);
    } else if (error instanceof TransactionError) {
      console.error("Transaction error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

export default solanaTranslateExample; 