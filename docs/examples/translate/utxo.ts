import { Translate } from '../../../src';
import { UTXOTranslateChain } from '../../../src/types/utxo';
import { TransactionsPage } from '../../../src/index';

async function main() {
  // Initialize the UTXO translator
  // Replace 'your-api-key-here' with your actual Noves API key
  // Or set the API_KEY environment variable: export API_KEY=your-api-key
  const apiKey = process.env.API_KEY || 'your-api-key-here';
  if (apiKey === 'your-api-key-here') {
    console.warn('Please set your API key either by replacing "your-api-key-here" or setting the API_KEY environment variable');
  }
  const translate = Translate.utxo(apiKey);

  try {
    // Get all supported chains
    console.log('Fetching supported chains...');
    const chains = await translate.getChains();
    console.log('Supported chains:', JSON.stringify(chains, null, 2));

    // Find details for a specific chain
    console.log('\nFinding Bitcoin chain details...');
    const btcChain = chains.find(chain => chain.name === 'btc');
    if (btcChain) {
      console.log('Bitcoin chain details:', JSON.stringify(btcChain, null, 2));
    } else {
      console.log('Bitcoin chain not found');
      return;
    }

    // Get transactions for a Bitcoin address with advanced pagination
    console.log('\nFetching transactions for a Bitcoin address...');
    const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Example Bitcoin address
    const transactionsPage = await translate.getTransactions('btc', address, {
      pageSize: 5,
      sort: 'desc'
    });

    // Process current page of transactions
    const currentTransactions = transactionsPage.getTransactions();
    console.log('First page of transactions:', currentTransactions.length, 'transactions');
    console.log('Has next page:', !!transactionsPage.getNextPageKeys());
    console.log('Has previous page:', transactionsPage.hasPrevious());

    // Show first transaction details
    if (currentTransactions.length > 0) {
      console.log('First transaction:', {
        hash: currentTransactions[0].rawTransactionData.transactionHash,
        type: currentTransactions[0].classificationData.type,
        blockNumber: currentTransactions[0].rawTransactionData.blockNumber
      });
    }

    // Demonstrate pagination navigation
    if (transactionsPage.getNextPageKeys()) {
      console.log('\nNavigating to next page...');
      await transactionsPage.next();
      const nextPageTransactions = transactionsPage.getTransactions();
      console.log('Next page transactions:', nextPageTransactions.length);
      console.log('Has previous page now:', transactionsPage.hasPrevious());
      
      // Go back to previous page
      if (transactionsPage.hasPrevious()) {
        console.log('Going back to previous page...');
        await transactionsPage.previous();
        const backToFirstPage = transactionsPage.getTransactions();
        console.log('Back to first page transactions:', backToFirstPage.length);
        console.log('Has previous page after going back:', transactionsPage.hasPrevious());
      }
    }

    // Advanced cursor-based pagination examples
    console.log('\n=== Cursor-Based Pagination Examples ===');
    
    // Get a fresh transactions page to demonstrate cursor features
    const cursorTransactionsPage = await translate.getTransactions('btc', address, {
      pageSize: 3
    });

    // Get cursor information
    const cursorInfo = cursorTransactionsPage.getCursorInfo();
    console.log('Cursor Info:', cursorInfo);

    // Extract individual cursors
    const nextCursor = cursorTransactionsPage.getNextCursor();
    const previousCursor = cursorTransactionsPage.getPreviousCursor();
    
    console.log('Next cursor:', nextCursor);
    console.log('Previous cursor:', previousCursor);

    // Demonstrate creating a page from a cursor
    if (nextCursor) {
      console.log('\nCreating new page from next cursor...');
      const pageFromCursor = await TransactionsPage.fromCursor(
        translate,
        'btc',
        address,
        nextCursor
      );
      
      console.log('Page from cursor has:', pageFromCursor.getTransactions().length, 'transactions');
      console.log('Page from cursor info:', pageFromCursor.getCursorInfo());
    }

    // Demonstrate cursor decoding
    if (nextCursor) {
      console.log('\nDecoding cursor to see page options...');
      const decodedPageOptions = TransactionsPage.decodeCursor(nextCursor);
      console.log('Decoded cursor:', decodedPageOptions);
    }

    // Example of getting derived addresses from different master key formats
    console.log('\nFetching derived addresses from xpub...');
    const xpub = 'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz';
    const xpubAddresses = await translate.getAddressesByMasterKey(xpub);
    console.log('xpub derived addresses:', xpubAddresses);

    console.log('\nFetching derived addresses from ypub...');
    const ypub = 'ypub6Ww3ibxVfGzLrAH1PNcjyAWenMTbbAosGNpj8ahQn9dDfJdLUKD1Bou4EQvjnyWYCJ8VGzHoLYpqJHYJg9Q7GvgEBXEZj6vDFkJ9pq8ABCD';
    const ypubAddresses = await translate.getAddressesByMasterKey(ypub);
    console.log('ypub derived addresses:', ypubAddresses);

    // Demonstrating backward compatibility
    console.log('\nUsing deprecated getAddressesByXpub method...');
    const legacyAddresses = await translate.getAddressesByXpub(xpub);
    console.log('Legacy method addresses:', legacyAddresses);

    // Example of getting transaction details
    console.log('\nFetching transaction details...');
    const txHash = '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e';
    
    // Default v5 format
    console.log('Getting transaction in v5 format (default)...');
    const txDetailsV5 = await translate.getTransaction('btc', txHash);
    const v5Details = txDetailsV5 as any; // Cast to access v5 format fields
    console.log('Transaction v5 format keys:', Object.keys(txDetailsV5));
    console.log('Has transfers array:', Array.isArray(v5Details.transfers));
    console.log('Has values array:', Array.isArray(v5Details.values));
    console.log('Timestamp location:', v5Details.timestamp ? 'root level' : 'rawTransactionData');

    // v2 format
    console.log('\nGetting transaction in v2 format...');
    const txDetailsV2 = await translate.getTransaction('btc', txHash, 2);
    console.log('Transaction v2 format keys:', Object.keys(txDetailsV2));
    // Cast to access v2 format fields for demonstration
    const v2Details = txDetailsV2 as any;
    console.log('Has sent array:', Array.isArray(v2Details.classificationData?.sent));
    console.log('Has received array:', Array.isArray(v2Details.classificationData?.received));
    console.log('Timestamp location:', v2Details.rawTransactionData?.timestamp ? 'rawTransactionData' : 'root level');

    // Example of v5 format with viewAsAccountAddress
    console.log('\nGetting transaction in v5 format with viewAsAccountAddress...');
    const viewAddress = '3Q9St1xqncesXHAs7eZ9ScE7jYWhdMtkXL';
    const txDetailsWithView = await translate.getTransaction('btc', txHash, 5, viewAddress);
    console.log('Transaction with viewAsAccountAddress - account:', txDetailsWithView.accountAddress);

    // Example of getting transactions with different formats
    console.log('\n=== Format Examples for getTransactions ===');
    
    // Default v2 format for getTransactions
    console.log('Getting transactions in v2 format (default)...');
    const transactionsV2Page = await translate.getTransactions('btc', address, { pageSize: 2 });
    const transactionsV2 = transactionsV2Page.getTransactions();
    if (transactionsV2.length > 0) {
      const firstTxV2 = transactionsV2[0] as any;
      console.log('First transaction v2 - has sent/received in classificationData:', 
        !!(firstTxV2.classificationData?.sent || firstTxV2.classificationData?.received));
      console.log('First transaction v2 - txTypeVersion:', firstTxV2.txTypeVersion);
    }

    // v5 format for getTransactions
    console.log('\nGetting transactions in v5 format...');
    const transactionsV5Page = await translate.getTransactions('btc', address, { 
      pageSize: 2, 
      v5Format: true 
    });
    const transactionsV5 = transactionsV5Page.getTransactions();
    if (transactionsV5.length > 0) {
      const firstTxV5 = transactionsV5[0] as any;
      console.log('First transaction v5 - has transfers array:', Array.isArray(firstTxV5.transfers));
      console.log('First transaction v5 - has values array:', Array.isArray(firstTxV5.values));
      console.log('First transaction v5 - txTypeVersion:', firstTxV5.txTypeVersion);
    }

    // Example of getting token balances
    console.log('\nFetching token balances...');
    const balances = await translate.getTokenBalances('btc', address);
    console.log('Token balances:', JSON.stringify(balances, null, 2));

    // Example of getting token balances with options
    console.log('\nFetching token balances with options...');
    const balancesWithOptions = await translate.getTokenBalances(
      'btc',
      address
    );
    console.log('Token balances with options:', JSON.stringify(balancesWithOptions, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error); 