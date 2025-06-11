import { TranslatePOLKADOT } from '../../../src/translate/translatePOLKADOT';
import { TransactionsPage } from '../../../src/index';

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

        // Get transactions with pagination
        const accountAddress = '5EmBLSaFfDgpDsmYLxVchwqrAJRY8sUJoHmrxQ9zSMBE5eq7';
        console.log(`\nGetting transactions with pagination for account: ${accountAddress}...`);
        const transactionsPage = await translate.getTransactions(chainName, accountAddress, {
            pageSize: 10,
            endBlock: 4000001
        });
        
        // Get current page transactions
        let transactions = transactionsPage.getTransactions();
        console.log('First page transactions:', transactions.length);
        console.log('Has next page:', !!transactionsPage.getNextPageKeys());
        console.log('Transactions:', JSON.stringify(transactions, null, 2));

        // Navigate through pages
        if (transactionsPage.getNextPageKeys()) {
            console.log('\nFetching next page...');
            await transactionsPage.next();
            
            const nextPageTransactions = transactionsPage.getTransactions();
            console.log('Second page transactions:', nextPageTransactions.length);
            console.log('Next page transactions:', JSON.stringify(nextPageTransactions, null, 2));
            
            // Go back to first page
            if (transactionsPage.hasPrevious()) {
                console.log('\nGoing back to first page...');
                await transactionsPage.previous();
                console.log('Back to first page transactions:', transactionsPage.getTransactions().length);
            }
        }

        // Process all transactions using iterator
        console.log('\nProcessing all transactions using iterator...');
        let count = 0;
        for await (const transaction of transactionsPage) {
            console.log(`Transaction ${++count}:`, {
                block: transaction.block,
                index: transaction.index,
                type: transaction.classificationData.type,
                description: transaction.classificationData.description
            });
        }

        // Advanced cursor-based pagination examples
        console.log('\n=== Cursor-Based Pagination Examples ===');
        
        // Get a fresh transactions page to demonstrate cursor features
        const cursorTransactionsPage = await translate.getTransactions(chainName, accountAddress, {
            pageSize: 3,
            endBlock: 4000001
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
                chainName,
                accountAddress,
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

    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error); 