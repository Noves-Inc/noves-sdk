/**
 * Move Translate API Examples
 * 
 * This file demonstrates how to use the Move Translate API to get transaction
 * data and classification for Move VM-based blockchains (currently Sui).
 */

import { Translate, TransactionError, ErrorType } from 'noves-sdk';

// Initialize the Move translate client
const translate = Translate.move("YOUR_API_KEY");

/**
 * Example 1: Get supported chains
 */
async function getSupportedChains() {
  try {
    console.log('Getting supported Move chains...');
    const chains = await translate.getChains();
    
    console.log('Supported chains:');
    chains.forEach(chain => {
      console.log(`- ${chain.name} (${chain.ecosystem}) - Tier ${chain.tier}`);
      console.log(`  Native coin: ${chain.nativeCoin.symbol} (${chain.nativeCoin.decimals} decimals)`);
    });
    
    return chains;
  } catch (error) {
    console.error('Error getting chains:', error);
    throw error;
  }
}

/**
 * Example 2: Get transaction types
 */
async function getTransactionTypes() {
  try {
    console.log('Getting supported transaction types...');
    const txTypes = await translate.getTransactionTypes();
    
    console.log(`Transaction types (version ${txTypes.version}):`);
    txTypes.transactionTypes.forEach(type => {
      console.log(`- ${type.type}: ${type.description}`);
    });
    
    return txTypes;
  } catch (error) {
    console.error('Error getting transaction types:', error);
    throw error;
  }
}

/**
 * Example 3: Get a single transaction
 */
async function getSingleTransaction() {
  try {
    const chain = 'sui';
    const txId = 'FjBLCN29D4JXGZxStZAGDibL4gv5xgVNK1HSHDn8s8aK';
    
    console.log(`Getting transaction ${txId} on ${chain}...`);
    const transaction = await translate.getTransaction(chain, txId);
    
    console.log('Transaction details:');
    console.log(`- Chain: ${transaction.chain}`);
    console.log(`- Type: ${transaction.classificationData.type}`);
    console.log(`- Description: ${transaction.classificationData.description}`);
    console.log(`- Timestamp: ${new Date(transaction.timestamp * 1000).toISOString()}`);
    console.log(`- Digest: ${transaction.rawTransactionData.digest}`);
    console.log(`- Signer: ${transaction.rawTransactionData.signer}`);
    console.log(`- Gas used: ${transaction.rawTransactionData.gasUsed}`);
    
    // Show transfers
    console.log('Transfers:');
    transaction.transfers.forEach((transfer, index) => {
      console.log(`  ${index + 1}. ${transfer.action}: ${transfer.amount} ${transfer.token.symbol}`);
      console.log(`     From: ${transfer.from.address}`);
      if (transfer.to) {
        console.log(`     To: ${transfer.to.address}`);
      }
    });
    
    // Show additional values
    if (transaction.values.length > 0) {
      console.log('Additional information:');
      transaction.values.forEach((value, index) => {
        if (value.failed) {
          console.log(`  Failed: ${value.failureReason}`);
        }
        if (value.commandTypes) {
          console.log(`  Command types: ${value.commandTypes.join(', ')}`);
        }
        if (value.checkpoint) {
          console.log(`  Checkpoint: ${value.checkpoint}`);
        }
      });
    }
    
    return transaction;
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
}

/**
 * Example 4: Get transactions for an address with pagination
 */
async function getTransactionsForAddress() {
  try {
    const chain = 'sui';
    const address = '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874';
    
    console.log(`Getting transactions for address ${address} on ${chain}...`);
    
    // Get first page
    const firstPage = await translate.getTransactions(chain, address, {
      pageSize: 5,
      sort: 'desc'
    });
    
    console.log(`Found ${firstPage.transactions.length} transactions on first page`);
    
    // Display transactions
    firstPage.transactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.rawTransactionData.digest}`);
      console.log(`   Type: ${tx.classificationData.type}`);
      console.log(`   Timestamp: ${new Date(tx.timestamp * 1000).toISOString()}`);
      console.log(`   Gas used: ${tx.rawTransactionData.gasUsed}`);
      
      // Show main transfer if any
      if (tx.transfers.length > 0) {
        const mainTransfer = tx.transfers[0];
        console.log(`   Transfer: ${mainTransfer.action} ${mainTransfer.amount} ${mainTransfer.token.symbol}`);
      }
      console.log('');
    });
    
    // Check for next page
    if (firstPage.hasNextPage()) {
      console.log('Getting next page...');
      const secondPage = await firstPage.getNextPage();
      console.log(`Found ${secondPage.transactions.length} transactions on second page`);
    } else {
      console.log('No more pages available');
    }
    
    return firstPage;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
}

/**
 * Example 5: Iterate through all transactions using async iteration
 */
async function iterateAllTransactions() {
  try {
    const chain = 'sui';
    const address = '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874';
    
    console.log(`Iterating through all transactions for ${address}...`);
    
    const firstPage = await translate.getTransactions(chain, address, {
      pageSize: 10
    });
    
    let count = 0;
    const transactionTypes = new Map<string, number>();
    
    // Use async iteration to go through all transactions
    for await (const transaction of firstPage) {
      count++;
      
      // Count transaction types
      const type = transaction.classificationData.type;
      transactionTypes.set(type, (transactionTypes.get(type) || 0) + 1);
      
      // Log every 10th transaction
      if (count % 10 === 0) {
        console.log(`Processed ${count} transactions...`);
      }
      
      // Stop after 50 for demo purposes
      if (count >= 50) {
        break;
      }
    }
    
    console.log(`\nProcessed ${count} transactions total`);
    console.log('Transaction type distribution:');
    for (const [type, count] of transactionTypes.entries()) {
      console.log(`- ${type}: ${count}`);
    }
    
  } catch (error) {
    console.error('Error iterating transactions:', error);
    throw error;
  }
}

/**
 * Example 6: Advanced error handling
 */
async function demonstrateErrorHandling() {
  try {
    console.log('Demonstrating error handling...');
    
    // Try to get a transaction with invalid parameters
    await translate.getTransaction('', '');
  } catch (error) {
    if (error instanceof TransactionError) {
      console.log('Caught TransactionError:');
      console.log(`- Type: ${error.errorType}`);
      console.log(`- Message: ${error.message}`);
      console.log(`- HTTP Status: ${error.httpStatusCode}`);
      
      switch (error.errorType) {
        case ErrorType.INVALID_REQUEST:
          console.log('This is an invalid request error - check your parameters');
          break;
        case ErrorType.RATE_LIMIT_EXCEEDED:
          console.log('Rate limit exceeded - should retry with backoff');
          break;
        case ErrorType.INVALID_API_KEY:
          console.log('Invalid API key - check your credentials');
          break;
        default:
          console.log('Unknown error type');
      }
    } else {
      console.log('Caught non-TransactionError:', error);
    }
  }
}

/**
 * Example 7: Using advanced retry configuration
 */
async function demonstrateRetryConfiguration() {
  try {
    console.log('Demonstrating retry configuration...');
    
    // Create client with production retry settings
    const productionTranslate = Translate.move({
      apiKey: "YOUR_API_KEY",
      retryConfig: "PRODUCTION"
    });
    
    // Create client with custom retry settings
    const customTranslate = Translate.move({
      apiKey: "YOUR_API_KEY",
      retryConfig: {
        enabled: true,
        maxAttempts: 5,
        baseDelay: 2000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        jitter: true,
        retryableErrors: [ErrorType.RATE_LIMIT_EXCEEDED, ErrorType.NETWORK_ERROR]
      }
    });
    
    // Use the configured client
    const chains = await productionTranslate.getChains();
    console.log(`Retrieved ${chains.length} chains with production retry config`);
    
  } catch (error) {
    console.error('Error with retry configuration:', error);
  }
}

/**
 * Example 8: Analyzing transaction patterns
 */
async function analyzeTransactionPatterns() {
  try {
    const chain = 'sui';
    const address = '0xa0766ff7b0325c18e4c7416ad4ea4d01e92f09147b8c5e7e4a582dc84ca3a874';
    
    console.log(`Analyzing transaction patterns for ${address}...`);
    
    const transactions = await translate.getTransactions(chain, address, {
      pageSize: 20
    });
    
    // Analyze patterns
    const analysis = {
      totalTransactions: transactions.transactions.length,
      typeDistribution: new Map<string, number>(),
      gasUsage: {
        total: 0,
        average: 0,
        min: Infinity,
        max: 0
      },
      timeRange: {
        earliest: Infinity,
        latest: 0
      },
      protocols: new Set<string>()
    };
    
    transactions.transactions.forEach(tx => {
      // Type distribution
      const type = tx.classificationData.type;
      analysis.typeDistribution.set(type, (analysis.typeDistribution.get(type) || 0) + 1);
      
      // Gas usage
      const gasUsed = parseInt(tx.rawTransactionData.gasUsed);
      analysis.gasUsage.total += gasUsed;
      analysis.gasUsage.min = Math.min(analysis.gasUsage.min, gasUsed);
      analysis.gasUsage.max = Math.max(analysis.gasUsage.max, gasUsed);
      
      // Time range
      analysis.timeRange.earliest = Math.min(analysis.timeRange.earliest, tx.timestamp);
      analysis.timeRange.latest = Math.max(analysis.timeRange.latest, tx.timestamp);
      
      // Protocols
      if (tx.classificationData.protocol.name) {
        analysis.protocols.add(tx.classificationData.protocol.name);
      }
    });
    
    analysis.gasUsage.average = analysis.gasUsage.total / analysis.totalTransactions;
    
    // Display analysis
    console.log('\n=== Transaction Analysis ===');
    console.log(`Total transactions analyzed: ${analysis.totalTransactions}`);
    
    console.log('\nTransaction types:');
    for (const [type, count] of analysis.typeDistribution.entries()) {
      const percentage = ((count / analysis.totalTransactions) * 100).toFixed(1);
      console.log(`- ${type}: ${count} (${percentage}%)`);
    }
    
    console.log('\nGas usage:');
    console.log(`- Total: ${analysis.gasUsage.total.toLocaleString()}`);
    console.log(`- Average: ${Math.round(analysis.gasUsage.average).toLocaleString()}`);
    console.log(`- Min: ${analysis.gasUsage.min.toLocaleString()}`);
    console.log(`- Max: ${analysis.gasUsage.max.toLocaleString()}`);
    
    console.log('\nTime range:');
    console.log(`- Earliest: ${new Date(analysis.timeRange.earliest * 1000).toISOString()}`);
    console.log(`- Latest: ${new Date(analysis.timeRange.latest * 1000).toISOString()}`);
    
    if (analysis.protocols.size > 0) {
      console.log('\nProtocols used:');
      for (const protocol of analysis.protocols) {
        console.log(`- ${protocol}`);
      }
    }
    
  } catch (error) {
    console.error('Error analyzing transactions:', error);
  }
}

/**
 * Main function to run all examples
 */
async function main() {
  console.log('=== Move Translate API Examples ===\n');
  
  try {
    // Run examples sequentially
    await getSupportedChains();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await getTransactionTypes();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await getSingleTransaction();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await getTransactionsForAddress();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await iterateAllTransactions();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await demonstrateErrorHandling();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await demonstrateRetryConfiguration();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await analyzeTransactionPatterns();
    
    console.log('\n=== All examples completed successfully! ===');
    
  } catch (error) {
    console.error('Example failed:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export functions for use in other files
export {
  getSupportedChains,
  getTransactionTypes,
  getSingleTransaction,
  getTransactionsForAddress,
  iterateAllTransactions,
  demonstrateErrorHandling,
  demonstrateRetryConfiguration,
  analyzeTransactionPatterns
};
