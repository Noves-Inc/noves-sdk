import { Translate } from '../../../src';

async function main() {
  // Initialize the UTXO translator
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable is not set');
  }
  const translate = Translate.utxo(apiKey);

  try {
    // Get all supported chains
    console.log('Fetching supported chains...');
    const chains = await translate.getChains();
    console.log('Supported chains:', JSON.stringify(chains, null, 2));

    // Get details for a specific chain
    console.log('\nFetching Bitcoin chain details...');
    const btcChain = await translate.getChain('btc');
    console.log('Bitcoin chain details:', JSON.stringify(btcChain, null, 2));

    // Get transactions for a Bitcoin address
    console.log('\nFetching transactions for a Bitcoin address...');
    const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Example Bitcoin address
    const transactions = await translate.Transactions('btc', address, {
      pageSize: 5,
      sort: 'desc'
    });

    console.log('First page of transactions:');
    for await (const tx of transactions) {
      console.log(JSON.stringify(tx, null, 2));
    }

    // Example of getting derived addresses from an xpub
    console.log('\nFetching derived addresses from xpub...');
    const xpub = 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4QVaRdMCqMc9gLZq3DzGDbwVtWfGJfLZJvfK69S7jbkQK1nMpEeMg4GiupAVKbBmp2aAixVeAxF1d';
    const addresses = await translate.getAddressesByXpub(xpub);
    console.log('Derived addresses:', addresses);

    // Example of getting transaction details
    console.log('\nFetching transaction details...');
    const txHash = '5df5adce7c6a0e2ac8af65d7a226fccac7896449c09570a214dcaf5b8c43f85e';
    const txDetails = await translate.getTransaction('btc', txHash);
    console.log('Transaction details:', JSON.stringify(txDetails, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error); 