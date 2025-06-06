import { Translate } from '../../../src';
import { UTXOTranslateChain } from '../../../src/types/utxo';

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

    // Get transactions for a Bitcoin address
    console.log('\nFetching transactions for a Bitcoin address...');
    const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Example Bitcoin address
    const transactions = await translate.getTransactions('btc', address, {
      pageSize: 5,
      sort: 'desc'
    });

    console.log('First page of transactions:');
    for await (const tx of transactions) {
      console.log(JSON.stringify(tx, null, 2));
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
    const txDetails = await translate.getTransaction('btc', txHash);
    console.log('Transaction details:', JSON.stringify(txDetails, null, 2));

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