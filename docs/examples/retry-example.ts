import { Translate, RetryHelpers } from '../../src';

async function basicRetryExample() {
  console.log('=== Basic Retry Example ===');
  
  // Simple: Enable retries with production defaults
  const translate = Translate.evm({
    apiKey: process.env.NOVES_API_KEY || 'your-api-key',
    retryConfig: 'PRODUCTION' // Use preset
  });

  try {
    const txInfo = await translate.getTransaction(
      'eth',
      '0x1cd4d61b9750632da36980329c240a5d2d2219a8cb3daaaebfaed4ae7b4efa22'
    );
    console.log('✅ Transaction retrieved successfully');
  } catch (error) {
    console.error('❌ Failed after retries:', error);
  }
}

async function customRetryExample() {
  console.log('\n=== Custom Retry with Monitoring ===');
  
  // Custom configuration with monitoring
  const translate = Translate.evm({
    apiKey: process.env.NOVES_API_KEY || 'your-api-key',
    retryConfig: RetryHelpers.forProduction({
      onRetry: (attempt, error, delay) => {
        console.log(`🔄 Retry ${attempt} in ${delay}ms - ${error.message}`);
      },
      onSuccess: (attempt) => {
        console.log(`✅ Success after ${attempt} attempts`);
      },
      onFailure: (attempts, error) => {
        console.log(`❌ Failed after ${attempts} attempts: ${error.message}`);
      }
    })
  });

  try {
    const transactionsPage = await translate.getTransactions('eth', '0x742d35Cc6634C0532925a3b8D4389dAAc8C4C', {
      pageSize: 5
    });
    console.log(`📄 Retrieved transactions page successfully`);
  } catch (error) {
    console.error('Request failed completely:', error);
  }
}

async function presetComparison() {
  console.log('\n=== Different Retry Presets ===');
  
  // Development: More aggressive retries
  const devTranslate = Translate.evm({
    apiKey: process.env.NOVES_API_KEY || 'your-api-key',
    retryConfig: 'DEVELOPMENT'
  });

  // Real-time: Fast fail for user-facing apps
  const realtimeTranslate = Translate.evm({
    apiKey: process.env.NOVES_API_KEY || 'your-api-key',
    retryConfig: 'REAL_TIME'
  });

  console.log('🔧 Development config: More retries for testing');
  console.log('⚡ Real-time config: Fast fail for good UX');
  console.log('🏭 Production config: Conservative and reliable');
}

// Run examples
async function runExamples() {
  await basicRetryExample();
  await customRetryExample();
  await presetComparison();
}

if (require.main === module) {
  runExamples().catch(console.error);
}
