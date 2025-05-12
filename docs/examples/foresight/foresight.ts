import { Foresight } from "../../../src/foresight/foresight";
import { TransactionError } from "../../../src/errors/TransactionError";
import { UnsignedTransaction, UserOperation } from "../../../src/types/types";

/**
 * Example demonstrating the usage of the Foresight API
 */
async function foresightExample() {
  // Initialize the Foresight client
  const foresight = new Foresight("YOUR_API_KEY");

  try {
    // 1. Get supported chains
    console.log("Fetching supported chains...");
    const chains = await foresight.getChains();
    console.log("Supported chains:", chains);

    // 2. Preview a transaction
    console.log("\nPreviewing a transaction...");
    const unsignedTx: UnsignedTransaction = {
      to: "0x1234567890123456789012345678901234567890",
      value: "0x0",
      data: "0x",
      from: "0xabcdef1234567890abcdef1234567890abcdef12",
      gas: "0x5208",
      gasPrice: "0x4a817c800",
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      type: "0x0"
    };

    const preview = await foresight.preview("eth", unsignedTx);
    console.log("Transaction preview:", preview);

    // 3. Preview a user operation
    console.log("\nPreviewing a user operation...");
    const userOp: UserOperation = {
      sender: "0x0576a174D229E3cFA37253523E645A78A0c91B37",
      nonce: 1,
      initCode: "0x",
      callData: "0xa9059cbb000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000003e8",
      callGasLimit: 120000,
      verificationGasLimit: 250000,
      preVerificationGas: 22000,
      maxFeePerGas: 70000000000,
      maxPriorityFeePerGas: 5000000000,
      paymasterAndData: "0x",
      signature: "0x"
    };

    const preview4337 = await foresight.preview4337("eth", userOp);
    console.log("User operation preview:", preview4337);

    // 4. Describe a transaction
    console.log("\nDescribing a transaction...");
    const description = await foresight.describe("eth", unsignedTx);
    console.log("Transaction description:", description);

    // 5. Screen a transaction
    console.log("\nScreening a transaction...");
    const screening = await foresight.screen("eth", {
      from: "0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65",
      to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      value: "0x16345785d8a0000",
      data: "0x",
      gas: "0x5208",
      gasPrice: null,
      maxFeePerGas: "0x4a817c800",
      maxPriorityFeePerGas: "0x3b9aca00",
      type: "0x2"
    });
    console.log("Transaction screening:", screening);

    // 6. Screen a user operation
    console.log("\nScreening a user operation...");
    const userOpScreening = await foresight.screen4337("eth", {
      sender: "0x8071Ed00bf71D8A9a3ff34BEFbbDFf9DF6f72E65",
      nonce: 0,
      initCode: "0x",
      callData: "0xa9059cbb000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000de0b6b3a7640000",
      callGasLimit: 100000,
      verificationGasLimit: 100000,
      preVerificationGas: 21000,
      maxFeePerGas: 20000000000,
      maxPriorityFeePerGas: 1000000000,
      paymasterAndData: "0x",
      signature: "0x"
    });
    console.log("User operation screening:", userOpScreening);

    // 7. Screen a URL
    console.log("\nScreening a URL...");
    const urlScreening = await foresight.screenUrl("https://uniswap-v3.com");
    console.log("URL screening:", urlScreening);

  } catch (error) {
    if (error instanceof TransactionError) {
      console.error("Transaction error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

// Run the example
foresightExample().catch(console.error); 