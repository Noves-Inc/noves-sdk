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

    // === Address Derivation Examples ===
    console.log('\n=== Address Derivation from Master Keys ===');
    
    // Example 1: Default behavior - 20 legacy addresses
    console.log('\n1. Default behavior - 20 legacy addresses from xpub:');
    const xpub = 'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz';
    const defaultAddresses = await translate.getAddressesByMasterKey(xpub);
    console.log('Default xpub addresses:', defaultAddresses.slice(0, 3), '...', `(${defaultAddresses.length} total)`);

    // Example 2: Custom count parameter
    console.log('\n2. Custom count - 50 legacy addresses:');
    const customCountAddresses = await translate.getAddressesByMasterKey(xpub, {
      count: 50
    });
    console.log('Custom count addresses:', customCountAddresses.slice(0, 3), '...', `(${customCountAddresses.length} total)`);

    // Example 3: SegWit addresses using numeric addressType
    console.log('\n3. SegWit addresses (numeric) from zpub:');
    const zpub = 'zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXgh3SsEF3C9vLpqHrwfbK6W1H2WdBLiHGvKJ8Q2Dpt6SbGwuL7X4VzNq3a';
    const segwitNumericAddresses = await translate.getAddressesByMasterKey(zpub, {
      addressType: 1  // SegWit
    });
    console.log('SegWit (numeric) addresses:', segwitNumericAddresses.slice(0, 3), '...', `(${segwitNumericAddresses.length} total)`);

    // Example 4: SegWit addresses using string addressType
    console.log('\n4. SegWit addresses (string) from zpub:');
    const segwitStringAddresses = await translate.getAddressesByMasterKey(zpub, {
      addressType: 'SegWit'
    });
    console.log('SegWit (string) addresses:', segwitStringAddresses.slice(0, 3), '...', `(${segwitStringAddresses.length} total)`);

    // Example 5: SegWitP2SH addresses from ypub
    console.log('\n5. SegWitP2SH addresses from ypub:');
    const ypub = 'ypub6Ww3ibxVfGzLrAH1PNcjyAWenMTbbAosGNpj8ahQn9dDfJdLUKD1Bou4EQvjnyWYCJ8VGzHoLYpqJHYJg9Q7GvgEBXEZj6vDFkJ9pq8ABCD';
    const segwitP2SHAddresses = await translate.getAddressesByMasterKey(ypub, {
      addressType: 'SegWitP2SH'
    });
    console.log('SegWitP2SH addresses:', segwitP2SHAddresses.slice(0, 3), '...', `(${segwitP2SHAddresses.length} total)`);

    // Example 6: Taproot addresses
    console.log('\n6. Taproot addresses from zpub:');
    const taprootAddresses = await translate.getAddressesByMasterKey(zpub, {
      count: 10,
      addressType: 'Taproot'
    });
    console.log('Taproot addresses:', taprootAddresses.slice(0, 3), '...', `(${taprootAddresses.length} total)`);

    // Example 7: Combined parameters - 100 SegWit addresses
    console.log('\n7. Combined parameters - 100 SegWit addresses:');
    const combinedParamsAddresses = await translate.getAddressesByMasterKey(zpub, {
      count: 100,
      addressType: 'SegWit'
    });
    console.log('Combined params addresses:', combinedParamsAddresses.slice(0, 3), '...', `(${combinedParamsAddresses.length} total)`);

    // Example 8: All address types comparison
    console.log('\n8. Address types comparison (first address of each type):');
    const legacyDemo = await translate.getAddressesByMasterKey(xpub, { count: 1, addressType: 'Legacy' });
    const segwitDemo = await translate.getAddressesByMasterKey(zpub, { count: 1, addressType: 'SegWit' });
    const segwitP2SHDemo = await translate.getAddressesByMasterKey(ypub, { count: 1, addressType: 'SegWitP2SH' });
    const taprootDemo = await translate.getAddressesByMasterKey(zpub, { count: 1, addressType: 'Taproot' });
    
    console.log('Legacy (starts with 1):', legacyDemo[0]);
    console.log('SegWit (starts with bc1):', segwitDemo[0]);
    console.log('SegWitP2SH (starts with 3):', segwitP2SHDemo[0]);
    console.log('Taproot (starts with bc1p):', taprootDemo[0]);

    // Demonstrating backward compatibility with deprecated method
    console.log('\n9. Backward compatibility - deprecated getAddressesByXpub:');
    const legacyMethodAddresses = await translate.getAddressesByXpub(xpub);
    console.log('Legacy method (default):', legacyMethodAddresses.slice(0, 3), '...', `(${legacyMethodAddresses.length} total)`);
    
    // Deprecated method with new parameters
    const legacyMethodWithParams = await translate.getAddressesByXpub(zpub, {
      count: 15,
      addressType: 'SegWit'
    });
    console.log('Legacy method (with params):', legacyMethodWithParams.slice(0, 3), '...', `(${legacyMethodWithParams.length} total)`);

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