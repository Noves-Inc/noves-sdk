/**
 * Example demonstrating the usage of FetchConfig for request timeouts,
 * AbortController signals, and custom headers in the Noves SDK.
 */

import { Translate, Pricing } from '../../src';

async function timeoutExample() {
  console.log('=== Timeout Example ===');

  // Set a 30-second timeout for all requests
  const translate = Translate.evm({
    apiKey: process.env.NOVES_API_KEY || 'your-api-key',
    fetchConfig: {
      timeout: 30000 // 30 seconds
    }
  });

  try {
    const chains = await translate.getChains();
    console.log(`Retrieved ${chains.length} chains`);

    const tx = await translate.getTransaction(
      'eth',
      '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22'
    );
    console.log(`Transaction type: ${tx.classificationData.type}`);
  } catch (error: any) {
    if (error.message?.includes('timed out')) {
      console.error('Request timed out - the API took too long to respond');
    } else {
      console.error('Request failed:', error.message);
    }
  }
}

async function abortControllerExample() {
  console.log('\n=== AbortController Example ===');

  const controller = new AbortController();

  const translate = Translate.evm({
    apiKey: process.env.NOVES_API_KEY || 'your-api-key',
    fetchConfig: {
      signal: controller.signal
    }
  });

  // Simulate cancellation after 2 seconds
  const cancelTimeout = setTimeout(() => {
    console.log('Aborting all in-flight requests...');
    controller.abort();
  }, 2000);

  try {
    const tx = await translate.getTransaction(
      'eth',
      '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22'
    );
    console.log(`Transaction retrieved: ${tx.classificationData.description}`);
    clearTimeout(cancelTimeout);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Request was cancelled via AbortController');
    } else {
      console.error('Request failed:', error.message);
    }
  }
}

async function customHeadersExample() {
  console.log('\n=== Custom Headers Example ===');

  const translate = Translate.evm({
    apiKey: process.env.NOVES_API_KEY || 'your-api-key',
    fetchConfig: {
      headers: {
        'X-Request-ID': `req-${Date.now()}`,
        'X-Client-Version': '2.0.0'
      }
    }
  });

  try {
    const chains = await translate.getChains();
    console.log(`Retrieved ${chains.length} chains with custom trace headers`);
  } catch (error: any) {
    console.error('Request failed:', error.message);
  }
}

async function combinedConfigExample() {
  console.log('\n=== Combined Configuration Example ===');

  const controller = new AbortController();

  // Combine fetchConfig with retryConfig for maximum resilience
  const translate = Translate.evm({
    apiKey: process.env.NOVES_API_KEY || 'your-api-key',
    retryConfig: 'PRODUCTION',
    fetchConfig: {
      timeout: 15000,
      signal: controller.signal,
      headers: { 'X-Trace-ID': `trace-${Date.now()}` }
    }
  });

  try {
    const transactionsPage = await translate.getTransactions(
      'eth',
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      { pageSize: 5 }
    );
    console.log(`Retrieved transactions page with combined config`);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Cancelled');
    } else {
      console.error('Failed:', error.message);
    }
  }
}

async function pricingWithTimeoutExample() {
  console.log('\n=== Pricing API with Timeout ===');

  const pricing = Pricing.evm({
    apiKey: process.env.NOVES_API_KEY || 'your-api-key',
    fetchConfig: {
      timeout: 10000 // 10 seconds
    }
  });

  try {
    const chains = await pricing.getChains();
    console.log(`Pricing supports ${chains.length} chains`);
  } catch (error: any) {
    console.error('Pricing request failed:', error.message);
  }
}

async function gracefulShutdownExample() {
  console.log('\n=== Graceful Shutdown Pattern ===');

  const controller = new AbortController();

  const translate = Translate.evm({
    apiKey: process.env.NOVES_API_KEY || 'your-api-key',
    fetchConfig: { signal: controller.signal }
  });

  // Simulate SIGTERM handler
  const shutdownHandler = () => {
    console.log('Shutting down - cancelling all SDK requests...');
    controller.abort();
  };

  // In a real application: process.on('SIGTERM', shutdownHandler);
  console.log('Server running with graceful shutdown support');
  console.log('SDK requests will be cancelled on SIGTERM');
}

// Run examples
async function runExamples() {
  await timeoutExample();
  await abortControllerExample();
  await customHeadersExample();
  await combinedConfigExample();
  await pricingWithTimeoutExample();
  await gracefulShutdownExample();
}

if (require.main === module) {
  runExamples().catch(console.error);
}
