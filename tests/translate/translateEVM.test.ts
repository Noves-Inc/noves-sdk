import nock from 'nock';
import { ChainNotFoundError } from '../../src/errors/ChainNotFoundError';
import { TransactionError } from '../../src/errors/TransactionError';
import { PageOptions, BalancesData, Token } from '../../src/types/types';
import { Translate } from '../../src';

jest.setTimeout(10000);

const BASE_URL = 'https://translate.noves.fi';

describe('TranslateEVM', () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable is not set');
  }
  const translate = Translate.evm(apiKey);

  beforeEach(() => {
    nock.cleanAll();
    // Add a 1-second delay between test runs to avoid rate limiting
    return new Promise(resolve => setTimeout(resolve, 1000));
  });

  it('should fetch chains successfully', async () => {
    const mockChains = [
      { 
        "ecosystem": "evm", 
        "evmChainId": 2741, 
        "name": "abstract",
        "nativeCoin": {
          "address": "ETH",
          "decimals": 18,
          "name": "ETH",
          "symbol": "ETH"
        },
        "tier": 2
      }
    ];

    nock(BASE_URL)
      .get('/evm/chains')
      .reply(200, mockChains);

    const response = await translate.getChains();
    expect(response[0]).toEqual(mockChains[0]);
    expect(response.length).toBeGreaterThan(0);
  });

  it('should fetch a chain successfully', async () => {
    const mockChain = { 
      "ecosystem": "evm", 
      "evmChainId": 1, 
      "name": "eth",
      "nativeCoin": {
        "address": "ETH",
        "decimals": 18,
        "name": "ETH",
        "symbol": "ETH"
      },
      "tier": 1
    };

    nock(BASE_URL)
      .get('/evm/chains')
      .reply(200, mockChain);

    const response = await translate.getChain("eth");
    expect(response).toEqual(mockChain);
  });

  it('should throw ChainNotFoundError when chain is not found', async () => {
    const mockChains = [
      { id: '1', name: 'ethereum' },
      { id: '2', name: 'bitcoin' }
    ];

    nock(BASE_URL)
      .get(`/evm/chain`)
      .reply(200, { succeeded: true, response: mockChains });

    try {
      await translate.getChain('nonexistent');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ChainNotFoundError);
      expect(error.message).toBe('Chain with name "nonexistent" not found.');
    }
  });

  it('should fetch a transaction successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/evm/eth/tx/0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const response = await translate.getTransaction('eth', '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22');
    expect(response).toHaveProperty("accountAddress", "0xA1EFa0adEcB7f5691605899d13285928AE025844")
    expect(response).toHaveProperty("rawTransactionData.blockNumber", 12345453)
    expect(response).toHaveProperty("rawTransactionData.timestamp", 1619833950)
    expect(response).toHaveProperty("classificationData.description", "Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.")
  });

  it('should fetch a describe transaction successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/evm/eth/describetx/0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const response = await translate.describeTransaction('eth', '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22');
    expect(response).toHaveProperty("type", "addLiquidity")
    expect(response).toHaveProperty("description", "Added 22,447.92 YD-ETH-MAR21 and 24,875.82 USDC to a liquidity pool.")
  });

  it('should handle transaction validation errors', async () => {
    const mockErrorResponse = {
      status: 400,
      errors: {
        chain: ['The field chain is invalid. Valid chains: eth, btc'],
        txHash: ['The field txHash must be a valid Transaction Hash.'],
      },
    };

    nock(BASE_URL)
      .get(`/evm/invalidChain/tx/invalidTxHash`)
      .reply(400, mockErrorResponse);

    try {
      await translate.getTransaction('invalidChain', 'invalidTxHash');
    } catch (error) {
      expect(error).toBeInstanceOf(TransactionError);
      expect((error as any).errors).toEqual(mockErrorResponse.errors);
    }
  });

  it('should handle transaction validation errors with incorrect tx hash', async () => {
    const mockErrorResponse = {
      status: 400,
      errors: {
        txHash: ['The field txHash must be a valid Transaction Hash.'],
      },
    };

    nock(BASE_URL)
      .get(`/evm/eth/tx/invalidTxHash`)
      .reply(400, mockErrorResponse);

    try {
      await translate.getTransaction('eth', 'invalidTxHash');
    } catch (error) {
      expect(error).toBeInstanceOf(TransactionError);
      expect((error as any).errors).toEqual(mockErrorResponse.errors);
    }
  });

  it('should handle transaction validation errors with invalid chain', async () => {
    const mockErrorResponse = {
      status: 400,
      errors: {
        chain: ['The field chain is invalid. Valid chains: eth, btc'],
      },
    };

    nock(BASE_URL)
      .get(`/evm/invalidChain/tx/0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22`)
      .reply(400, mockErrorResponse);

    try {
      await translate.getTransaction('invalidChain', '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22');
    } catch (error) {
      expect(error).toBeInstanceOf(TransactionError);
      expect((error as any).errors).toEqual(mockErrorResponse.errors);
    }
  });

  it('should fetch token balances successfully with specific tokens (POST)', async () => {
    const tokens = [
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72'
    ];

    const mockBalances: BalancesData[] = [
        {
            balance: "129.1960665220077568",
            token: {
                address: "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
                decimals: 18,
                name: "Ethereum Name Service",
                symbol: "ENS"
            },
            usdValue: null
        },
        {
            balance: "0",
            token: {
                address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                decimals: 18,
                name: "Wrapped Ether",
                symbol: "WETH"
            },
            usdValue: null
        }
    ];

    nock(BASE_URL)
        .post('/evm/eth/tokens/balancesOf/0x9B1054d24dC31a54739B6d8950af5a7dbAa56815', tokens)
        .reply(200, mockBalances);

    const result = await translate.getTokenBalances('eth', '0x9B1054d24dC31a54739B6d8950af5a7dbAa56815', tokens);
    
    // Sort both arrays by token address for consistent comparison
    const sortedResult = [...result].sort((a: BalancesData, b: BalancesData) => 
        a.token.address.localeCompare(b.token.address)
    );
    
    // Verify schema for each balance entry
    sortedResult.forEach(balance => {
        expect(balance).toHaveProperty('balance');
        expect(balance).toHaveProperty('token');
        expect(balance.token).toHaveProperty('address');
        expect(balance.token).toHaveProperty('decimals');
        expect(balance.token).toHaveProperty('name');
        expect(balance.token).toHaveProperty('symbol');
    });
  });

  describe('getTokenBalances', () => {
    it('should fetch all token balances', async () => {
        const mockBalances: BalancesData[] = [
            {
                balance: "0.156826463558015911",
                token: {
                    address: "ETH",
                    decimals: 18,
                    name: "Ether",
                    symbol: "ETH"
                },
                usdValue: null
            },
            {
                balance: "129.196066522007754429",
                token: {
                    address: "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
                    decimals: 18,
                    name: "Ethereum Name Service",
                    symbol: "ENS"
                },
                usdValue: null
            },
            {
                balance: "0.000400181543331181",
                token: {
                    address: "0x15b7c0c907e4c6b9adaaaabc300c08991d6cea05",
                    decimals: 18,
                    name: "Gelato Network Token",
                    symbol: "GEL"
                },
                usdValue: null
            }
        ];

        nock(BASE_URL)
            .get('/evm/eth/tokens/balancesOf/0x9B1054d24dC31a54739B6d8950af5a7dbAa56815')
            .reply(200, mockBalances);

        const result = await translate.getTokenBalances('eth', '0x9B1054d24dC31a54739B6d8950af5a7dbAa56815');
        
        // Verify schema for each balance entry
        result.forEach(balance => {
            expect(balance).toHaveProperty('balance');
            expect(balance).toHaveProperty('token');
            expect(balance.token).toHaveProperty('address');
            expect(balance.token).toHaveProperty('decimals');
            expect(balance.token).toHaveProperty('name');
            expect(balance.token).toHaveProperty('symbol');
        });
    }, 30000);

    it('should fetch specific token balances', async () => {
        const mockBalances: BalancesData[] = [
            {
                balance: "0.000400181543331181",
                token: {
                    address: "0x15b7c0c907e4c6b9adaaaabc300c08991d6cea05",
                    decimals: 18,
                    name: "Gelato Network Token",
                    symbol: "GEL"
                },
                usdValue: null
            },
            {
                balance: "0.000000000000135097",
                token: {
                    address: "0xd533a949740bb3306d119cc777fa900ba034cd52",
                    decimals: 18,
                    name: "Curve DAO Token",
                    symbol: "CRV"
                },
                usdValue: null
            }
        ];

        const tokens = [
            "0x15b7c0c907e4c6b9adaaaabc300c08991d6cea05",
            "0xd533a949740bb3306d119cc777fa900ba034cd52"
        ];

        nock(BASE_URL)
            .post('/evm/eth/tokens/balancesOf/0x9B1054d24dC31a54739B6d8950af5a7dbAa56815', tokens)
            .reply(200, mockBalances);

        const result = await translate.getTokenBalances('eth', '0x9B1054d24dC31a54739B6d8950af5a7dbAa56815', tokens);
        
        // Verify schema for each balance entry
        result.forEach(balance => {
            expect(balance).toHaveProperty('balance');
            expect(balance).toHaveProperty('token');
            expect(balance.token).toHaveProperty('address');
            expect(balance.token).toHaveProperty('decimals');
            expect(balance.token).toHaveProperty('name');
            expect(balance.token).toHaveProperty('symbol');
        });
    });

    it('should fetch token balances with block number successfully', async () => {
        const mockBalances: BalancesData[] = [
            {
                balance: "0",
                token: {
                    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                    decimals: 18,
                    name: "Wrapped Ether",
                    symbol: "WETH"
                },
                usdValue: null
            }
        ];

        const blockNumber = 12345678;
        const tokens = ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"];

        nock(BASE_URL)
            .post(`/evm/eth/tokens/balancesOf/0x9B1054d24dC31a54739B6d8950af5a7dbAa56815?block=${blockNumber}`, tokens)
            .reply(200, mockBalances);

        const result = await translate.getTokenBalances('eth', '0x9B1054d24dC31a54739B6d8950af5a7dbAa56815', tokens, blockNumber);
        
        // Verify schema for each balance entry
        result.forEach(balance => {
            expect(balance).toHaveProperty('balance');
            expect(balance).toHaveProperty('token');
            expect(balance.token).toHaveProperty('address');
            expect(balance.token).toHaveProperty('decimals');
            expect(balance.token).toHaveProperty('name');
            expect(balance.token).toHaveProperty('symbol');
        });
    });
  });

  it('should fetch first page transactions successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/evm/eth/txs/0xA1EFa0adEcB7f5691605899d13285928AE025844`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paginator = await translate.Transactions('eth', '0xA1EFa0adEcB7f5691605899d13285928AE025844');
    expect(paginator.getTransactions()).toHaveLength(10)

  });

  it('should fetch first page transactions with custom paging successfully', async () => {
    const mockTransactions = [
      { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' },
      { id: '2', hash: '0x2cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa33' }
    ];

    nock(BASE_URL)
      .get(`/evm/eth/txs/0xA1EFa0adEcB7f5691605899d13285928AE025844`)
      .query(true)
      .reply(200, { 
        succeeded: true, 
        response: {
          items: mockTransactions,
          hasNextPage: true,
          nextPageUrl: 'https://api.example.com/next-page'
        }
      });

    const paging: PageOptions = {
      startBlock: 20104079,
      sort: 'desc'
    }

    const txEngine = await translate.Transactions('eth', '0xA1EFa0adEcB7f5691605899d13285928AE025844', paging);
    expect(txEngine.getTransactions()).toHaveLength(10);
    expect(txEngine.getCurrentPageKeys()).toEqual(paging);
  });

  it('should fetch a page and then the second one using the next method successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/evm/eth/txs/0xA1EFa0adEcB7f5691605899d13285928AE025844`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paginator = await translate.Transactions('eth', '0xA1EFa0adEcB7f5691605899d13285928AE025844');
    expect(paginator.getTransactions()).toHaveLength(10)

    await paginator.next()
    expect(paginator.getTransactions()).toHaveLength(10)

  });

  it('should fetch first page history successfully', async () => {
    const mockTransaction = { id: '1', hash: '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22' };

    nock(BASE_URL)
      .get(`/evm/eth/txs/0xA1EFa0adEcB7f5691605899d13285928AE025844`)
      .reply(200, { succeeded: true, response: mockTransaction });

    const paginator = await translate.History('eth', '0xA1EFa0adEcB7f5691605899d13285928AE025844');
    expect(paginator.getTransactions()).toHaveLength(100)

  });

  it('should handle API errors gracefully', async () => {
    nock(BASE_URL)
        .get('/evm/eth/tokens/balancesOf/0x9B1054d24dC31a54739B6d8950af5a7dbAa56815')
        .reply(500, { 
            status: 500,
            errors: {
                message: 'Internal server error'
            }
        });

    try {
        await translate.getTokenBalances('eth', '0x9B1054d24dC31a54739B6d8950af5a7dbAa56815');
    } catch (error: any) {
        expect(error.message).toContain('Internal server error');
    }
  });

  describe('getTxTypes', () => {
    it('should return a list of transaction types', async () => {
      const mockTxTypes = {
        transactionTypes: [
          {
            type: 'addLiquidity',
            description: 'The user enters a liquidity pool by adding one or more tokens to the pool.'
          },
          {
            type: 'addressPoisoning',
            description: 'Used to classify malicious transactions where a spoof transfer is generated with a destination address that is similar to one that the user has previously transacted with.'
          },
          {
            type: 'admin',
            description: 'A broad type that covers all kinds of administrative actions that users might take when calling contracts, without transferring assets in the process.'
          },
          {
            type: 'approveNFTCollection',
            description: 'The user grants permission for a contract to transfer any NFTs of a particular collection that are owned by the user.'
          },
          {
            type: 'approveSingleNFT',
            description: 'The user grants permission for a contract to transfer only one specific NFT.'
          },
          {
            type: 'approveToken',
            description: 'The user allows a contract to spend a certain amount of units of a given token, owned by the user.'
          },
          {
            type: 'borrow',
            description: 'The user borrows assets, typically after providing collateral to a lending protocol.'
          },
          {
            type: 'burnNFT',
            description: 'Burn a specific NFT, removing it permanently from the user\'s wallet and the associated collection.'
          },
          {
            type: 'burnToken',
            description: 'Burn a specified amount of tokens, effectively reducing the total supply.'
          },
          {
            type: 'buyNFT',
            description: 'The user buys an NFT, typically paying with a fungible asset (token).'
          },
          {
            type: 'cancelNFTListing',
            description: 'An NFT seller cancels a previously-created listing to sell a particular NFT.'
          },
          {
            type: 'cancelOrder',
            description: 'A previously-placed limit order (or similar) gets canceled in a decentralized exchange.'
          },
          {
            type: 'claimAndStake',
            description: 'A special case of claimRewards, where the rewards are claimed and staked in the same transaction.'
          },
          {
            type: 'claimRewards',
            description: 'The user collects accumulated rewards from a protocol or staking pool.'
          },
          {
            type: 'composite',
            description: 'A broad type to capture complex cases that execute multiple actions in one atomic transaction (for example, an addLiquidity followed by a swap and then a stake)'
          },
          {
            type: 'createContract',
            description: 'The user triggers the creation of a contract by calling a parent or factory contract. For example, a new Safe multisig.'
          },
          {
            type: 'createNFTListing',
            description: 'An NFT seller creates a listing to sell one or more NFTs.'
          },
          {
            type: 'delegate',
            description: 'The user delegates voting power in a protocol to a different address.'
          },
          {
            type: 'deployContract',
            description: 'A new contract is deployed onchain.'
          },
          {
            type: 'depositCollateral',
            description: 'The user deposits collateral (either fungible or non-fungible assets) into a protocol, to later borrow against it.'
          },
          {
            type: 'depositToExchange',
            description: 'The user deposits funds into a centralized or decentralized exchange.'
          },
          {
            type: 'failed',
            description: 'Broad type that covers all cases where a transaction failed to execute for any reason (out of gas, contract revert, etc).'
          },
          {
            type: 'fillOrder',
            description: 'An open order on a decentralized exchange gets filled. For example, a limit order to long an asset at a certain price.'
          },
          {
            type: 'gambling',
            description: 'The user participates in an onchain lottery / betting protocol of some kind.'
          },
          {
            type: 'gaming',
            description: 'Broad type that covers all kinds of onchain games.'
          },
          {
            type: 'issueLoan',
            description: 'A lender issues a loan, typically granted in a peer-to-peer manner to a single borrower.'
          },
          {
            type: 'leveragedFarming',
            description: 'The user enters or manages a previously-opened leveraged farming position, typically by borrowing and re-staking an asset several times (looping).'
          },
          {
            type: 'liquidate',
            description: 'A user\'s position in a lending protocol or decentralized market gets liquidated.'
          },
          {
            type: 'lock',
            description: 'A user locks tokens for a given timeframe, typically to earn voting rights or increase their staking yield.'
          },
          {
            type: 'mev',
            description: 'Broad transaction type to capture any kind of bot / automated arbitrage activity.'
          },
          {
            type: 'migrateToken',
            description: 'Occurs when a user migrates between two representations of the same token (in cases where the protocol deployed a new contract address for the token).'
          },
          {
            type: 'mintNFT',
            description: 'A user mints a new NFT, either for free or by paying a minting fee.'
          },
          {
            type: 'placeNFTBid',
            description: 'A user places a bid to purchase an NFT at a given price.'
          },
          {
            type: 'placeOrder',
            description: 'A user opens an order (typically a limit order) in a decentralized exchange, to be filled at a future time.'
          },
          {
            type: 'protocol',
            description: 'This covers all kinds of protocol maintenance and upkeeping transactions, typically executed by a bot with privileged access to certain contracts.'
          },
          {
            type: 'rebalancePosition',
            description: 'A user that previously opened a position (typically in a trading protocol) rebalances it, usually by supplying/withdrawing collateral.'
          },
          {
            type: 'receiveFromBridge',
            description: 'The user receives funds from a cross-chain bridge.'
          },
          {
            type: 'receiveLoanRepayment',
            description: 'A lender receives a partial or full repayment for a loan they previously extended.'
          },
          {
            type: 'receiveNFT',
            description: 'The user receives an NFT.'
          },
          {
            type: 'receiveNFTAirdrop',
            description: 'The user receives an NFT airdrop.'
          },
          {
            type: 'receiveNFTRoyalty',
            description: 'An NFT creator receives royalties for transfers or sales of one of their NFTs.'
          },
          {
            type: 'receiveSpamNFT',
            description: 'A spam NFT is received by the user.'
          },
          {
            type: 'receiveSpamToken',
            description: 'A spam token is received by the user '
          },
          {
            type: 'receiveToken',
            description: 'The user receives a fungible token.'
          },
          {
            type: 'receiveTokenAirdrop',
            description: 'The user receives a token airdrop.'
          },
          {
            type: 'refinanceLoan',
            description: 'A borrower refinances an existing loan, typically by paying off the previous loan and starting a new one with a different interest rate.'
          },
          {
            type: 'refund',
            description: 'The user receives a refund from a contract, typically associated with a previous action taken by the user.'
          },
          {
            type: 'registerDomain',
            description: 'The user registers an onchain domain (for example ENS)'
          },
          {
            type: 'removeLiquidity',
            description: 'The user removes one or more tokens from a liquidity pool where they had previously added liquidity.'
          },
          {
            type: 'renewDomain',
            description: 'The user renews a registration for an onchain domain.'
          },
          {
            type: 'repayLoan',
            description: 'The user repays (partially or in full) an onchain loan, typically taken against a lending protocol.'
          },
          {
            type: 'revokeNFTCollectionApproval',
            description: 'The user revokes a previously-granted approval for a contract to spend any NFTs in a collection owned by the user.'
          },
          {
            type: 'revokeTokenApproval',
            description: 'The user revokes a previously-granted approval for a contract to spend a certain amount of a fungible token.'
          },
          {
            type: 'sellNFT',
            description: 'The user sells an NFT, typically using an NFT marketplace protocol.'
          },
          {
            type: 'sendNFT',
            description: 'The user sends an NFT.'
          },
          {
            type: 'sendNFTAirdrop',
            description: 'The user triggers an airdrop of NFTs.'
          },
          {
            type: 'sendToBridge',
            description: 'The user initiates a bridge transaction by sending funds from the source chain.'
          },
          {
            type: 'sendToken',
            description: 'The user sends a certain amount of a fungible token.'
          },
          {
            type: 'sendTokenAirdrop',
            description: 'The user triggers an airdrop of tokens.'
          },
          {
            type: 'signMultisig',
            description: 'The user signs a multisig transaction (Gnosis Safe or similar).'
          },
          {
            type: 'stakeNFT',
            description: 'The user stakes an NFT, typically to earn yield or in the context of an onchain game.'
          },
          {
            type: 'stakeToken',
            description: 'The user stakes fungible tokens into a protocol (typically for yield purposes). Also reported when the a validator stakes tokens.'
          },
          {
            type: 'swap',
            description: 'Reported when two or more fungible tokens are traded in the transaction, typically by using a decentralized exchange protocol.'
          },
          {
            type: 'system',
            description: 'This transaction type covers system-wide / blockchain-maintenance transactions for the chain as a whole.'
          },
          {
            type: 'unclassified',
            description: 'This type is returned when we\'re unable to classify the transaction. Even if this type is returned, all relevant asset transfers are always returned.'
          },
          {
            type: 'unstakeNFT',
            description: 'The user unstakes a previously-staked NFT.'
          },
          {
            type: 'unstakeToken',
            description: 'The user unstakes previously-staked tokens.'
          },
          {
            type: 'unverifiedContract',
            description: 'This type is reported when the contract being called in the transaction is unverified (no ABI available), and we\'re unable to match it via bytecode with known contracts.'
          },
          {
            type: 'unwrap',
            description: 'This type is reported when the user unwraps a previously-wrapped asset, typically the native coin of the chain.'
          },
          {
            type: 'vote',
            description: 'The user participates in DAO governance by voting (typically for an onchain governance proposal).'
          },
          {
            type: 'withdrawCollateral',
            description: 'The user removes previously-deposited collateral, typically in the context of a lending protocol.'
          },
          {
            type: 'withdrawFromExchange',
            description: 'The user withdraws funds from a centralized or decentralized exchange.'
          },
          {
            type: 'wrap',
            description: 'This type is reported when the user wraps an asset (typically the native coin of the chain) and receives a wrapped version of it.'
          }
        ],
        version: 1
      };

      nock('https://translate.noves.fi')
        .get('/api/v1/evm/txTypes')
        .reply(200, {
          succeeded: true,
          response: mockTxTypes
        });

      const result = await translate.getTxTypes();
      expect(result).toEqual(mockTxTypes);
    });
  });
});