import { TranslatePOLKADOT } from '../../../src/translate/translatePOLKADOT';

async function main() {
    // Initialize the Polkadot Translate client
    const apiKey = process.env.NOVES_API_KEY || 'your-api-key';
    const translate = new TranslatePOLKADOT(apiKey);

    try {
        // Get all supported Polkadot chains
        console.log('Getting supported chains...');
        const chains = await translate.getChains();
        console.log('Supported chains:', chains);

        // Get details for a specific chain
        const chainName = 'bittensor';
        console.log(`\nGetting details for chain: ${chainName}...`);
        const chain = await translate.getChain(chainName);
        console.log('Chain details:', chain);

        // Get transaction details
        const blockNumber = 4000000;
        const txIndex = 1;
        console.log(`\nGetting transaction details for block ${blockNumber}, index ${txIndex}...`);
        const transaction = await translate.getTransaction(chainName, blockNumber, txIndex);
        console.log('Transaction details:', JSON.stringify(transaction, null, 2));

        // Get transaction description
        console.log('\nGetting transaction description...');
        const description = await translate.describeTransaction(chainName, blockNumber, txIndex);
        console.log('Transaction description:', description);

        // Get multiple transaction descriptions
        console.log('\nGetting multiple transaction descriptions...');
        const descriptions = await translate.describeTransactions(chainName, [
            { blockNumber, index: txIndex },
            { blockNumber: blockNumber + 1, index: 0 }
        ]);
        console.log('Transaction descriptions:', descriptions);

        // Get paginated transactions for an account
        const accountAddress = '5FxcZraZACr4L78jWkcYe3FHdiwiAUzrKLVtsSwkvFobBKqq';
        console.log(`\nGetting transactions for account: ${accountAddress}...`);
        const transactionsPage = await translate.Transactions(chainName, accountAddress, {
            pageSize: 10,
            startBlock: blockNumber - 1000,
            endBlock: blockNumber
        });

        // Iterate through transactions
        console.log('First page of transactions:');
        const transactions = transactionsPage.getTransactions();
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