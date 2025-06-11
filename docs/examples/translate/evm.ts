import { Translate, TransactionsPage } from "../../../src/index";
import { ChainNotFoundError } from "../../../src/errors/ChainNotFoundError";
import { TransactionError } from "../../../src/errors/TransactionError";
import { EVMTranslateHistoryData } from "../../../src/types/evm";

/**
 * Example demonstrating the usage of the EVM Translate API
 */
async function evmTranslateExample() {
  // Initialize the EVM translator using the factory pattern
  const evmTranslate = Translate.evm("YOUR_API_KEY");

  try {
    // 1. Get supported chains
    console.log("Fetching supported chains...");
    const chains = await evmTranslate.getChains();
    console.log("Supported chains:");
    chains.forEach((chain) => {
      console.log(`  ${chain.name} (Chain ID: ${chain.evmChainId}, Tier: ${chain.tier})`);
      console.log(`    Native token: ${chain.nativeCoin.symbol} (${chain.nativeCoin.name})`);
      console.log(`    Decimals: ${chain.nativeCoin.decimals}`);
    });

    // 2. Get token balances for an account
    const accountAddress = "0x9B1054d24dC31a54739B6d8950af5a7dbAa56815";
    console.log("\nFetching token balances...");
    
    // Get all token balances (includes prices by default)
    const allBalances = await evmTranslate.getTokenBalances("eth", accountAddress);
    console.log("All token balances:", allBalances);
    // Example output:
    // [
    //   {
    //     balance: "0.154531375828269479",
    //     usdValue: "409.819641724502397",
    //     token: {
    //       symbol: "ETH",
    //       name: "Ether",
    //       decimals: 18,
    //       address: "ETH",
    //       price: "2652.01574455620225"
    //     }
    //   }
    // ]

    // Get balances for specific tokens (POST request - no prices included)
    const specificTokens = [
      "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72", // ENS
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"  // WETH
    ];
    const specificBalances = await evmTranslate.getTokenBalances("eth", accountAddress, specificTokens);
    console.log("Specific token balances:", specificBalances);
    // Example output:
    // [
    //   {
    //     balance: "129.1960665220077568",
    //     token: {
    //       symbol: "ENS",
    //       name: "Ethereum Name Service",
    //       decimals: 18,
    //       address: "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72"
    //     }
    //   }
    // ]

    // Get historical balances at a specific block
    const historicalBalances = await evmTranslate.getTokenBalances(
      "eth",
      accountAddress,
      undefined,
      18500000 // Block number
    );
    console.log("Historical token balances:", historicalBalances);

    // Get balances with custom parameters
    const customBalances = await evmTranslate.getTokenBalances(
      "eth",
      accountAddress,
      undefined,
      undefined,
      true,  // includePrices
      false, // excludeZeroPrices (include tokens with zero prices)
      true   // excludeSpam
    );
    console.log("Custom parameter balances:", customBalances);

    // 3. Get transaction history with pagination
    console.log("\nFetching transaction history...");
    const transactionsPage = await evmTranslate.getHistory(
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

    // 3a. Get full transactions with pagination using the new getTransactions method
    console.log("\nFetching full transactions using getTransactions...");
    const fullTransactionsPage = await evmTranslate.getTransactions(
      "eth",
      accountAddress,
      { 
        pageSize: 3,
        startBlock: 14637919,
        endBlock: 15289488,
        sort: 'desc',
        liveData: false,
        viewAsTransactionSender: false,
        v5Format: false // Use v2 format
      }
    );

    // Process full transactions
    console.log("\nProcessing full transactions (v2 format):");
    const fullTransactions = fullTransactionsPage.getTransactions();
    fullTransactions.forEach((tx, index) => {
      console.log(`Full Transaction ${index + 1}:`);
      console.log(`  Hash: ${tx.rawTransactionData.transactionHash}`);
      console.log(`  Type: ${tx.classificationData.type}`);
      console.log(`  Description: ${tx.classificationData.description}`);
      console.log(`  Version: ${tx.txTypeVersion}`);
      
      // Check for approval transactions with the new approved field
      if ('approved' in tx.classificationData && tx.classificationData.approved) {
        console.log(`  Approval Details:`);
        console.log(`    Spender: ${tx.classificationData.approved.spender}`);
        console.log(`    Amount: ${tx.classificationData.approved.amount}`);
        console.log(`    Token: ${tx.classificationData.approved.token.symbol}`);
      }
      
      // v2 format has sent/received arrays
      if (tx.txTypeVersion === 2) {
        console.log(`  Sent: ${tx.classificationData.sent.length} transfers`);
        console.log(`  Received: ${tx.classificationData.received.length} transfers`);
      }
      console.log('---');
    });

    // Test v5 format as well
    console.log("\nFetching full transactions using getTransactions (v5 format)...");
    const v5TransactionsPage = await evmTranslate.getTransactions(
      "eth",
      accountAddress,
      { 
        pageSize: 2,
        startBlock: 14637919,
        endBlock: 15289488,
        sort: 'desc',
        liveData: false,
        viewAsTransactionSender: false,
        v5Format: true // Use v5 format
      }
    );

    // Process v5 transactions
    console.log("\nProcessing full transactions (v5 format):");
    const v5Transactions = v5TransactionsPage.getTransactions();
    v5Transactions.forEach((tx, index) => {
      console.log(`V5 Transaction ${index + 1}:`);
      console.log(`  Hash: ${tx.rawTransactionData.transactionHash}`);
      console.log(`  Type: ${tx.classificationData.type}`);
      console.log(`  Description: ${tx.classificationData.description}`);
      console.log(`  Version: ${tx.txTypeVersion}`);
      
      // Check for approval transactions with the new approved field in v5
      if ('approved' in tx.classificationData && tx.classificationData.approved) {
        console.log(`  Approval Details:`);
        console.log(`    Spender: ${tx.classificationData.approved.spender}`);
        console.log(`    Amount: ${tx.classificationData.approved.amount}`);
        console.log(`    Token: ${tx.classificationData.approved.token.symbol}`);
      }
      
      if (tx.txTypeVersion === 5) {
        console.log(`  Transfers: ${tx.transfers.length} transfers`);
        console.log(`  Values: ${tx.values.length} values`);
      }
      console.log('---');
    });

    // 3b. Demonstrate advanced pagination navigation
    console.log("\nDemonstrating advanced pagination navigation...");
    console.log("Current page has:", fullTransactionsPage.getTransactions().length, "transactions");
    console.log("Has next page:", !!fullTransactionsPage.getNextPageKeys());
    console.log("Has previous page:", fullTransactionsPage.hasPrevious());

    // Go to next page if available
    if (fullTransactionsPage.getNextPageKeys()) {
      await fullTransactionsPage.next();
      console.log("Moved to next page. Now has:", fullTransactionsPage.getTransactions().length, "transactions");
      console.log("Has previous page now:", fullTransactionsPage.hasPrevious());
      
      // Go back to previous page
      if (fullTransactionsPage.hasPrevious()) {
        await fullTransactionsPage.previous();
        console.log("Went back to previous page. Now has:", fullTransactionsPage.getTransactions().length, "transactions");
        console.log("Has previous page after going back:", fullTransactionsPage.hasPrevious());
      }
    }

    // Process transactions
    let count = 0;
    let currentTransactions = transactionsPage.getTransactions() as EVMTranslateHistoryData[];
    
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
      currentTransactions = transactionsPage.getTransactions() as EVMTranslateHistoryData[];
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

    // 3c. Advanced cursor-based pagination examples
    console.log("\n=== Cursor-Based Pagination Examples ===");
    
    // Get a fresh transactions page to demonstrate cursor features
    const cursorTransactionsPage = await evmTranslate.getTransactions("eth", accountAddress, {
      pageSize: 5
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
        evmTranslate,
        "eth",
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
          evmTranslate, 
          chain, 
          address, 
          cursor
        );
      } else {
        // Start from beginning
        transactionsPage = await evmTranslate.getTransactions(chain, address, {
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
    const customPage1 = await getTransactionsWithCustomPagination("eth", accountAddress);
    console.log("Custom page 1:", {
      transactionCount: customPage1.transactions.length,
      pageInfo: customPage1.pageInfo
    });

    if (customPage1.pageInfo.endCursor) {
      console.log("Getting second page with custom interface...");
      const customPage2 = await getTransactionsWithCustomPagination(
        "eth", 
        accountAddress, 
        customPage1.pageInfo.endCursor
      );
      console.log("Custom page 2:", {
        transactionCount: customPage2.transactions.length,
        pageInfo: customPage2.pageInfo
      });
    }

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
    
    // Get transaction in v5 format (default)
    console.log("\nFetching transaction details (v5 format)...");
    const txDetailsV5 = await evmTranslate.getTransaction("eth", txHash, 5);
    if (txDetailsV5.txTypeVersion === 5) {
      console.log("Transaction details (v5):", {
        txTypeVersion: txDetailsV5.txTypeVersion,
        chain: txDetailsV5.chain,
        accountAddress: txDetailsV5.accountAddress,
        classificationData: {
          type: txDetailsV5.classificationData.type,
          description: txDetailsV5.classificationData.description,
          protocol: txDetailsV5.classificationData.protocol,
          source: txDetailsV5.classificationData.source
        },
        transfers: txDetailsV5.transfers.slice(0, 2), // Show first 2 transfers
        values: txDetailsV5.values,
        rawTransactionData: {
          transactionHash: txDetailsV5.rawTransactionData.transactionHash,
          fromAddress: txDetailsV5.rawTransactionData.fromAddress,
          toAddress: txDetailsV5.rawTransactionData.toAddress,
          blockNumber: txDetailsV5.rawTransactionData.blockNumber,
          gas: txDetailsV5.rawTransactionData.gas,
          gasUsed: txDetailsV5.rawTransactionData.gasUsed,
          gasPrice: txDetailsV5.rawTransactionData.gasPrice,
          transactionFee: txDetailsV5.rawTransactionData.transactionFee,
          timestamp: txDetailsV5.rawTransactionData.timestamp
        }
      });
    }

    // Get transaction in v2 format
    console.log("\nFetching transaction details (v2 format)...");
    const txDetailsV2 = await evmTranslate.getTransaction("eth", txHash, 2);
    if (txDetailsV2.txTypeVersion === 2) {
      console.log("Transaction details (v2):", {
        txTypeVersion: txDetailsV2.txTypeVersion,
        chain: txDetailsV2.chain,
        accountAddress: txDetailsV2.accountAddress,
        classificationData: {
          type: txDetailsV2.classificationData.type,
          description: txDetailsV2.classificationData.description,
          protocol: txDetailsV2.classificationData.protocol,
          source: txDetailsV2.classificationData.source,
          sent: txDetailsV2.classificationData.sent.slice(0, 2), // Show first 2 sent
          received: txDetailsV2.classificationData.received.slice(0, 2) // Show first 2 received
        },
        rawTransactionData: {
          transactionHash: txDetailsV2.rawTransactionData.transactionHash,
          fromAddress: txDetailsV2.rawTransactionData.fromAddress,
          toAddress: txDetailsV2.rawTransactionData.toAddress,
          blockNumber: txDetailsV2.rawTransactionData.blockNumber,
          gas: txDetailsV2.rawTransactionData.gas,
          gasUsed: txDetailsV2.rawTransactionData.gasUsed,
          gasPrice: txDetailsV2.rawTransactionData.gasPrice,
          transactionFee: txDetailsV2.rawTransactionData.transactionFee,
          timestamp: txDetailsV2.rawTransactionData.timestamp
        }
      });
    }

    // 7a. Get transaction details with viewAsAccountAddress (v2 format)
    console.log("\nFetching transaction details with viewAsAccountAddress (DSProxy perspective)...");
    const contractAddress = "0xaD270aDA5Ce83C6B87976E33D829763f03fD59f1"; // DSProxy contract address
    const txDetailsWithView = await evmTranslate.getTransaction("eth", txHash, 2, contractAddress);
    if (txDetailsWithView.txTypeVersion === 2) {
      console.log("Transaction details (from contract perspective):", {
        txTypeVersion: txDetailsWithView.txTypeVersion,
        chain: txDetailsWithView.chain,
        accountAddress: txDetailsWithView.accountAddress, // This will be the viewAsAccountAddress
        classificationData: {
          type: txDetailsWithView.classificationData.type,
          description: txDetailsWithView.classificationData.description,
          protocol: txDetailsWithView.classificationData.protocol,
          source: txDetailsWithView.classificationData.source,
          sent: txDetailsWithView.classificationData.sent.slice(0, 2), // Show first 2 sent from contract's perspective
          received: txDetailsWithView.classificationData.received.slice(0, 2) // Show first 2 received from contract's perspective
        },
        rawTransactionData: {
          transactionHash: txDetailsWithView.rawTransactionData.transactionHash,
          fromAddress: txDetailsWithView.rawTransactionData.fromAddress,
          toAddress: txDetailsWithView.rawTransactionData.toAddress,
          blockNumber: txDetailsWithView.rawTransactionData.blockNumber,
          gas: txDetailsWithView.rawTransactionData.gas,
          gasUsed: txDetailsWithView.rawTransactionData.gasUsed,
          gasPrice: txDetailsWithView.rawTransactionData.gasPrice,
          transactionFee: txDetailsWithView.rawTransactionData.transactionFee,
          timestamp: txDetailsWithView.rawTransactionData.timestamp
        }
      });
    }

    // 8. Get transaction description for a single transaction
    console.log("\nFetching description for a single transaction...");
    const singleTxDescription = await evmTranslate.describeTransaction("eth", txHash);
    console.log("Single transaction description:", {
      type: singleTxDescription.type,
      description: singleTxDescription.description
    });

    // 8a. Get transaction description with viewAsAccountAddress
    console.log("\nFetching description with viewAsAccountAddress...");
    const viewAsAddress = "0xA1EFa0adEcB7f5691605899d13285928AE025844";
    const singleTxDescriptionWithView = await evmTranslate.describeTransaction("eth", txHash, viewAsAddress);
    console.log("Single transaction description (with view):", {
      type: singleTxDescriptionWithView.type,
      description: singleTxDescriptionWithView.description
    });

    // 9. Get transaction descriptions for multiple transactions
    console.log("\nFetching descriptions for multiple transactions...");
    const txHashes = [
      "0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22",
      "0x2cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa23"
    ];
    const txDescriptions = await evmTranslate.describeTransactions("eth", txHashes);
    console.log("Transaction descriptions:", txDescriptions.map(desc => ({
      txHash: desc.txHash,
      type: desc.type,
      description: desc.description
    })));

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
  const evmTranslate = Translate.evm("YOUR_API_KEY");

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