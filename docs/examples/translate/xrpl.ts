/**
 * XRPL Translate API Examples
 * 
 * This file demonstrates how to use the XRPL Translate API
 * to get human-readable transaction descriptions and metadata.
 */

import { Translate, TranslateXRPL, TransactionError } from '../../../src';

// Initialize the XRPL translate client
const apiKey = 'your-api-key-here';
const translateXRPL: TranslateXRPL = Translate.xrpl(apiKey);

/**
 * Example 1: Get supported chains
 */
async function getSupportedChains() {
  try {
    console.log('🔗 Getting supported XRPL chains...');
    
    const chains = await translateXRPL.getChains();
    console.log('Supported chains:', chains);
    
    return chains;
  } catch (error) {
    console.error('Error getting chains:', error);
  }
}

/**
 * Example 2: Get a single transaction
 */
async function getSingleTransaction() {
  try {
    console.log('🔍 Getting single XRPL transaction...');
    
    const txHash = 'CC706248C7A7AB42D5D8E03191FBEF6DCC72D23BDB9E1FB0FAC7D039C31FBFAE';
    const transaction = await translateXRPL.getTransaction('xrpl', txHash);
    
    console.log('Transaction details:');
    console.log('- Type:', transaction.classificationData.type);
    console.log('- Description:', transaction.classificationData.description);
    console.log('- Account:', transaction.accountAddress);
    console.log('- Timestamp:', new Date(transaction.timestamp * 1000));
    console.log('- Transfers:', transaction.transfers.length);
    
    // Show transfer details
    transaction.transfers.forEach((transfer, index) => {
      console.log(`  Transfer ${index + 1}:`);
      console.log(`    Action: ${transfer.action}`);
      console.log(`    Amount: ${transfer.amount} ${transfer.token.symbol}`);
      console.log(`    From: ${transfer.from.address}`);
      console.log(`    To: ${transfer.to.address}`);
      if (transfer.token.issuer) {
        console.log(`    Token Issuer: ${transfer.token.issuer}`);
      }
    });
    
    return transaction;
  } catch (error) {
    console.error('Error getting transaction:', error);
  }
}

/**
 * Example 3: Get transaction from specific perspective
 */
async function getTransactionFromPerspective() {
  try {
    console.log('👁️ Getting transaction from specific perspective...');
    
    const txHash = 'CC706248C7A7AB42D5D8E03191FBEF6DCC72D23BDB9E1FB0FAC7D039C31FBFAE';
    const viewAsAddress = 'r4QqFdgZWoHhJwzhLs2dhR7pgGMfg1cSGf';
    
    const transaction = await translateXRPL.getTransaction('xrpl', txHash, viewAsAddress);
    
    console.log('Transaction from perspective of', viewAsAddress);
    console.log('Description:', transaction.classificationData.description);
    
    return transaction;
  } catch (error) {
    console.error('Error getting transaction from perspective:', error);
  }
}

/**
 * Example 4: Get paginated transactions
 */
async function getPaginatedTransactions() {
  try {
    console.log('📄 Getting paginated XRPL transactions...');
    
    const accountAddress = 'rBcKWiVq48WXW8it7aZm54Nzo83TFB1Bye';
    
    // Get first page
    const transactionsPage = await translateXRPL.getTransactions('xrpl', accountAddress, {
      pageSize: 10
    });
    
    console.log(`Found ${transactionsPage.getTransactions().length} transactions on first page`);
    console.log('Has next page:', transactionsPage.hasNext());
    
    // Show first few transactions
    transactionsPage.getTransactions().slice(0, 3).forEach((tx, index) => {
      console.log(`Transaction ${index + 1}:`);
      console.log(`  Type: ${tx.classificationData.type}`);
      console.log(`  Description: ${tx.classificationData.description}`);
      console.log(`  Date: ${new Date(tx.timestamp * 1000).toLocaleString()}`);
    });
    
    // Get next page if available
    if (transactionsPage.hasNext()) {
      console.log('\n⏭️ Getting next page...');
      const hasNextPage = await transactionsPage.next();
      if (hasNextPage) {
        console.log(`Found ${transactionsPage.getTransactions().length} transactions on second page`);
      }
    }
    
    return transactionsPage;
  } catch (error) {
    console.error('Error getting paginated transactions:', error);
  }
}

/**
 * Example 5: Get token balances
 */
async function getTokenBalances() {
  try {
    console.log('💰 Getting XRPL token balances...');
    
    const accountAddress = 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn';
    
    const balances = await translateXRPL.getTokenBalances('xrpl', accountAddress);
    
    console.log(`Account: ${balances.accountAddress}`);
    console.log(`Timestamp: ${new Date(balances.timestamp * 1000).toLocaleString()}`);
    console.log(`Number of tokens: ${balances.balances.length}`);
    
    console.log('\nToken balances:');
    balances.balances.forEach((balance, index) => {
      console.log(`  ${index + 1}. ${balance.token.symbol} (${balance.token.name})`);
      console.log(`     Balance: ${balance.balance}`);
      console.log(`     Decimals: ${balance.token.decimals}`);
      console.log(`     Address: ${balance.token.address}`);
      if (balance.token.issuer && balance.token.issuer !== 'XRP') {
        console.log(`     Issuer: ${balance.token.issuer}`);
      }
      console.log('');
    });
    
    return balances;
  } catch (error) {
    console.error('Error getting token balances:', error);
  }
}

/**
 * Example 6: Get token balances with prices
 */
async function getTokenBalancesWithPrices() {
  try {
    console.log('💵 Getting XRPL token balances with prices...');
    
    const accountAddress = 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn';
    
    const balances = await translateXRPL.getTokenBalances('xrpl', accountAddress, true);
    
    console.log('Token balances with prices:');
    balances.balances.forEach((balance) => {
      const price = (balance.token as any).price || 'N/A';
      const usdValue = price !== 'N/A' ? (parseFloat(balance.balance) * parseFloat(price)).toFixed(2) : 'N/A';
      
      console.log(`  ${balance.token.symbol}: ${balance.balance}`);
      console.log(`    Price: $${price}`);
      console.log(`    USD Value: $${usdValue}`);
    });
    
    return balances;
  } catch (error) {
    console.error('Error getting token balances with prices:', error);
  }
}

/**
 * Example 7: Get historical balances
 */
async function getHistoricalBalances() {
  try {
    console.log('📈 Getting historical XRPL token balances...');
    
    const accountAddress = 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn';
    
    // Get balances at validated ledger
    const validatedBalances = await translateXRPL.getTokenBalances(
      'xrpl', 
      accountAddress, 
      false, 
      'validated'
    );
    
    console.log('Balances at validated ledger:');
    validatedBalances.balances.forEach((balance) => {
      console.log(`  ${balance.token.symbol}: ${balance.balance}`);
    });
    
    // Get balances at current ledger
    const currentBalances = await translateXRPL.getTokenBalances(
      'xrpl', 
      accountAddress, 
      false, 
      'current'
    );
    
    console.log('\nBalances at current ledger:');
    currentBalances.balances.forEach((balance) => {
      console.log(`  ${balance.token.symbol}: ${balance.balance}`);
    });
    
    return { validatedBalances, currentBalances };
  } catch (error) {
    console.error('Error getting historical balances:', error);
  }
}

/**
 * Example 8: Portfolio tracking
 */
async function trackPortfolio() {
  try {
    console.log('📊 Tracking XRPL portfolio...');
    
    const accountAddress = 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn';
    
    // Get balances with prices
    const balances = await translateXRPL.getTokenBalances('xrpl', accountAddress, true);
    
    // Calculate portfolio metrics
    let totalValue = 0;
    const holdings: Array<{symbol: string, balance: number, price: number, value: number}> = [];
    
    balances.balances.forEach((balance) => {
      const balanceNum = parseFloat(balance.balance);
      const price = parseFloat((balance.token as any).price || '0');
      const value = balanceNum * price;
      
      holdings.push({
        symbol: balance.token.symbol,
        balance: balanceNum,
        price: price,
        value: value
      });
      
      totalValue += value;
    });
    
    console.log('Portfolio Summary:');
    console.log(`Total Value: $${totalValue.toFixed(2)}`);
    console.log('\nHoldings:');
    
    // Sort by value (highest first)
    holdings.sort((a, b) => b.value - a.value);
    
    holdings.forEach((holding, index) => {
      const percentage = totalValue > 0 ? (holding.value / totalValue * 100).toFixed(1) : '0.0';
      console.log(`  ${index + 1}. ${holding.symbol}`);
      console.log(`     Balance: ${holding.balance.toFixed(6)}`);
      console.log(`     Price: $${holding.price.toFixed(4)}`);
      console.log(`     Value: $${holding.value.toFixed(2)} (${percentage}%)`);
    });
    
    return { balances, totalValue, holdings };
  } catch (error) {
    console.error('Error tracking portfolio:', error);
  }
}

/**
 * Example 9: Transaction analysis
 */
async function analyzeTransactions() {
  try {
    console.log('🔍 Analyzing XRPL transactions...');
    
    const accountAddress = 'rBcKWiVq48WXW8it7aZm54Nzo83TFB1Bye';
    
    // Get transactions
    const transactionsPage = await translateXRPL.getTransactions('xrpl', accountAddress, {
      pageSize: 50
    });
    
    // Analyze transaction types
    const typeStats: Record<string, number> = {};
    const tokensSent = new Set<string>();
    const tokensReceived = new Set<string>();
    
    transactionsPage.getTransactions().forEach((tx) => {
      const type = tx.classificationData.type;
      typeStats[type] = (typeStats[type] || 0) + 1;
      
      tx.transfers.forEach((transfer) => {
        if (transfer.action === 'sent') {
          tokensSent.add(transfer.token.symbol);
        } else if (transfer.action === 'received') {
          tokensReceived.add(transfer.token.symbol);
        }
      });
    });
    
    console.log('Transaction Analysis:');
    console.log(`Total transactions analyzed: ${transactionsPage.getTransactions().length}`);
    console.log('\nTransaction types:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log(`\nTokens sent: ${Array.from(tokensSent).join(', ')}`);
    console.log(`Tokens received: ${Array.from(tokensReceived).join(', ')}`);
    
    return { typeStats, tokensSent: Array.from(tokensSent), tokensReceived: Array.from(tokensReceived) };
  } catch (error) {
    console.error('Error analyzing transactions:', error);
  }
}

/**
 * Example 10: Error handling
 */
async function demonstrateErrorHandling() {
  try {
    console.log('⚠️ Demonstrating error handling...');
    
    // Try to get a transaction with invalid hash
    await translateXRPL.getTransaction('xrpl', 'invalid-hash');
    
  } catch (error) {
    if (error instanceof TransactionError) {
      console.log('Caught TransactionError:');
      console.log('Message:', error.message);
      console.log('Error details:', error.errors);
    } else {
      console.log('Caught other error:', error);
    }
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('🚀 Starting XRPL Translate API Examples\n');
  
  await getSupportedChains();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await getSingleTransaction();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await getTransactionFromPerspective();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await getPaginatedTransactions();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await getTokenBalances();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await getTokenBalancesWithPrices();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await getHistoricalBalances();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await trackPortfolio();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await analyzeTransactions();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await demonstrateErrorHandling();
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('✅ All examples completed!');
}

// Export individual functions for use in other files
export {
  getSupportedChains,
  getSingleTransaction,
  getTransactionFromPerspective,
  getPaginatedTransactions,
  getTokenBalances,
  getTokenBalancesWithPrices,
  getHistoricalBalances,
  trackPortfolio,
  analyzeTransactions,
  demonstrateErrorHandling,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}