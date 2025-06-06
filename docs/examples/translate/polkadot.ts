import { TranslatePOLKADOT } from '../../../src/translate/translatePOLKADOT';

async function main() {
    // Initialize the Polkadot Translate client
    // Replace 'your-api-key-here' with your actual Noves API key
    // Or set the NOVES_API_KEY environment variable: export NOVES_API_KEY=your-api-key
    const apiKey = process.env.NOVES_API_KEY || 'your-api-key-here';
    if (apiKey === 'your-api-key-here') {
        console.warn('Please set your API key either by replacing "your-api-key-here" or setting the NOVES_API_KEY environment variable');
    }
    const translate = new TranslatePOLKADOT(apiKey);

    try {
        // Get all supported Polkadot chains
        console.log('Getting supported chains...');
        const chains = await translate.getChains();
        console.log('Supported chains:', chains);

        // Get transaction details
        const chainName = 'bittensor';
        const blockNumber = 4000000;
        const txIndex = 1;
        console.log(`\nGetting transaction details for block ${blockNumber}, index ${txIndex}...`);
        const transaction = await translate.getTransaction(chainName, blockNumber, txIndex);
        console.log('Transaction details:', JSON.stringify(transaction, null, 2));

        // Get transactions using the new getTransactions method (recommended)
        const accountAddress = '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7';
        console.log(`\nGetting transactions using getTransactions method for account: ${accountAddress}...`);
        const response = await translate.getTransactions(chainName, accountAddress, {
            pageSize: 10,
            endBlock: 4000001
        });
        
        console.log('Direct API response:');
        console.log('Number of transactions:', response.items.length);
        console.log('Has next page:', response.nextPageSettings.hasNextPage);
        console.log('Transactions:', JSON.stringify(response.items, null, 2));

        // Handle pagination manually with getTransactions
        if (response.nextPageSettings.hasNextPage && response.nextPageSettings.nextPageUrl) {
            console.log('\nNext page URL available:', response.nextPageSettings.nextPageUrl);
            // You would need to parse the URL parameters and make another call
        }

        // Example using the deprecated Transactions method (for comparison)
        console.log(`\n--- Using deprecated Transactions method (for backward compatibility) ---`);
        const transactionsPage = await translate.Transactions(chainName, accountAddress, {
            pageSize: 10,
            endBlock: 4000001
        });

        // Iterate through transactions
        console.log('First page of transactions:');
        const transactions = transactionsPage.getTransactions();
        console.log(`Found ${transactions.length} transactions`);
        console.log(JSON.stringify(transactions, null, 2));

        // Get next page if available
        if (transactionsPage.getNextPageKeys()) {
            console.log('\nGetting next page of transactions...');
            const hasNext = await transactionsPage.next();
            if (hasNext) {
                console.log('Next page transactions:', JSON.stringify(transactionsPage.getTransactions(), null, 2));
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error); 