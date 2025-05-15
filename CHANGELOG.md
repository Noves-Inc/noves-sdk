# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.0.16] - 2025-05-15

### Added
- Enhanced Move Pricing API coverage:
    - New `PricingMove` class for Move ecosystem pricing
    - New `getChains` method for retrieving supported Move chains
    - New `getChain` method for retrieving specific chain information
    - New `getPriceFromPool` method for token price retrieval from liquidity pools
    - New documentation file for Move Pricing API
    - New examples directory with Move Pricing usage examples

### Changed
- Enhanced Move Pricing API implementation:
    - Improved chain name handling with automatic transformation
    - Enhanced error handling with chain-specific error types
    - Improved test coverage with comprehensive test cases
    - Updated documentation with detailed examples

### Fixed
- Improved error handling for invalid chain names
- Fixed price type validation in price retrieval


## [1.0.15] - 2025-05-15

### Added
- Enhanced Cosmos Pricing API coverage:
    - New `PriceType` enum for standardized price type selection
    - New `getPrice` method for token price retrieval with timestamp support
    - New documentation file for Cosmos Pricing API
    - New examples directory with Cosmos Pricing usage examples

### Changed
- Enhanced Cosmos Pricing API implementation:
    - Improved price type handling
    - Updated chain name handling with automatic transformation
    - Enhanced error handling with chain-specific error types
    - Improved test coverage with comprehensive test cases

### Fixed
- Improved error handling for invalid chain names
- Fixed price type validation in price retrieval


## [1.0.14] - 2025-05-15

### Added
- Enhanced SVM Pricing API coverage:
    - New `PricingSVM` class for Solana Virtual Machine pricing
    - New `PriceType` enum for standardized price type selection
    - New `getChains` method for retrieving supported SVM chains
    - New `getChain` method for retrieving specific chain information
    - New `getPrice` method for token price retrieval with timestamp support
    - New documentation file for SVM Pricing API
    - New examples directory with SVM Pricing usage examples

### Changed
- Enhanced SVM Pricing API implementation:
    - Improved price type handling with default to `dexHighestLiquidity`
    - Updated chain name handling with automatic transformation for "solana"
    - Enhanced error handling with chain-specific error types
    - Improved test coverage with comprehensive test cases

### Fixed
- Improved error handling for invalid chain names
- Fixed price type validation in price retrieval


## [1.0.13] - 2025-05-15

### Added
- Enhanced EVM Pricing API coverage:
    - New `PriceType` enum for standardized price type selection
    - Added comprehensive interfaces for token prefetch requests and responses
    - New documentation file for EVM Pricing API
    - New examples directory with EVM Pricing usage examples
    - Enhanced type definitions for pricing responses

### Changed
- Enhanced EVM Pricing API implementation:
    - Improved price type handling with default to `dexHighestLiquidity`
    - Updated `preFetchPrice` method with proper request formatting and response typing
    - Updated the Pricing interface with more comprehensive types
    - Improved error handling with chain name transformation
    - Enhanced test coverage with comprehensive test cases

### Fixed
- Fixed request body structure in `preFetchPrice` method
- Fixed response parsing for token prefetch results
- Improved chain name handling with automatic transformation from "ethereum" to "eth"


## [1.0.12] - 2025-05-12

### Added
- Enhanced Foresight API coverage:
    - New `screen` method for transaction risk analysis
    - New `screen4337` method for ERC-4337 user operation risk analysis
    - New `screenUrl` method for URL risk analysis
    - New comprehensive type definitions for Foresight API responses
    - New documentation file for Foresight API
    - New examples directory with Foresight usage examples

### Changed
- Enhanced Foresight API implementation:
    - Improved error handling with more specific error messages
    - Enhanced transaction processing with better type safety
    - Updated request body structure for better API compatibility
    - Improved URL utilities for better parameter handling
    - Enhanced test coverage with comprehensive test cases
- Updated Foresight API structure:
    - Added response validation for better type safety
    - Improved error handling for invalid response formats
    - Enhanced parameter handling in API requests
    - Refactored request body structure for better consistency

### Fixed
- Fixed request body structure in preview and describe methods
- Improved error handling for API responses
- Fixed parameter handling in URL screening
- Fixed response validation in describe4337 method


## [1.0.11] - 2025-05-12

### Added
- Enhanced Polkadot Translate API coverage:
    - New `describeTransaction` method for single transaction description
    - New `describeTransactions` method for batch transaction description
    - New comprehensive type definitions for Polkadot transactions
    - New documentation file for Polkadot API
    - New examples directory with Polkadot usage examples

### Changed
- Enhanced Polkadot Translate API implementation:
    - Improved error handling with more specific error messages
    - Enhanced transaction processing with better type safety
    - Updated transaction retrieval with comprehensive data
    - Improved URL utilities for better pagination handling
    - Enhanced test coverage with comprehensive test cases
- Updated Polkadot Translate API structure:
    - Added async iterator protocol for better transaction iteration
    - Improved type safety and validation in API responses
    - Enhanced error handling for invalid response formats
    - Refactored base class implementation for better code reuse

### Fixed
- Fixed transaction validation in Polkadot Translate API
- Improved error handling for API responses
- Fixed address validation in Polkadot Translate API
- Fixed pagination handling in transaction retrieval


## [1.0.10] - 2025-05-12

### Added
- Enhanced TVM Translate API coverage:
    - New `describeTransaction` method for single transaction description
    - New `describeTransactions` method for batch transaction description
    - New `getTransactionStatus` method for transaction status tracking
    - New `getRawTransaction` method for detailed transaction data
    - New `startBalancesJob` and `getBalancesJobResults` methods for async balance processing
    - New documentation file for TVM API
    - New examples directory with TVM usage examples

### Changed
- Enhanced TVM Translate API implementation:
    - Improved error handling with more specific error messages
    - Enhanced transaction processing with better type safety
    - Updated transaction retrieval with comprehensive data
    - Improved URL utilities for better pagination handling
    - Enhanced test coverage with comprehensive test cases
- Updated TVM Translate API structure:
    - Added async iterator protocol for better transaction iteration
    - Improved type safety and validation in API responses
    - Enhanced error handling for invalid response formats
    - Refactored base class implementation for better code reuse

### Fixed
- Fixed transaction validation in TVM Translate API
- Improved error handling for API responses
- Fixed address validation in TVM Translate API
- Fixed pagination handling in transaction retrieval


## [1.0.9] - 2025-05-09

### Added
- Enhanced SVM Translate API coverage:
    - New `getTokenBalances` method for retrieving token balances with price options
    - New `getTransactionCount` method for account transaction counting
    - New `getStakingTransactions` method with pagination support
    - New `getStakingEpoch` method for detailed staking information
    - New documentation file for SVM API
    - New examples directory with SVM usage examples

### Changed
- Enhanced SVM Translate API coverage:
    - Improved error handling with more specific error messages
    - Enhanced transaction processing with better type safety
    - Updated token balance retrieval with price filtering options
    - Improved URL utilities for better pagination handling
    - Enhanced test coverage with comprehensive test cases
- Updated SVM Translate API implementation:
    - Added async iterator protocol for better transaction iteration
    - Improved type safety and validation in API responses
    - Enhanced error handling for invalid response formats

### Fixed
- Fixed token balance validation in SVM Translate API
- Improved error handling for API responses
- Fixed address validation in SVM Translate API


## [1.0.8] - 2025-05-09

### Added
- Enhanced UTXO Translate API coverage:
    - New `getTransaction` method for retrieving detailed transaction information
    - Support for pagination with page numbers in `PageOptions` interface
    - New documentation file for UTXO API
    - New examples directory with usage examples

### Changed
- Enhanced UTXO Translate API coverage:
    - Improved error handling with more specific error messages
    - Enhanced `TransactionsPage` class with block number and token address filtering
    - Updated `getAddressesByXpub` endpoint structure
    - Improved URL utilities for better pagination handling
    - Enhanced test coverage with comprehensive test cases
- Updated UTXO Translate API implementation:
    - Added async iterator protocol for better transaction iteration
    - Improved type safety and validation in API responses
    - Enhanced error handling for invalid response formats

### Fixed
- Fixed URL parsing for pagination parameters
- Improved error handling for API responses
- Fixed address validation in UTXO Translate API


## [1.0.7] - 2025-05-09

### Added
- Enhanced EVM Translate API coverage:
    - New `describeTransactions` method for batch transaction description
    - New `getBlockTransactions` method for retrieving block transactions
    - New `getTokenHolders` method with pagination support
    - New `startTransactionJob` and `getTransactionJobResults` methods for async transaction processing
    - Added v5 format support for transaction retrieval
- Improved Cosmos Translate API coverage:
    - Added comprehensive address validation
    - Enhanced error handling with Cosmos-specific error types
    - New utility functions for Cosmos address validation

### Changed
- Enhanced EVM Translate API coverage:
    - Improved `getTokenBalances` method with additional filtering options
    - Updated transaction history pagination with new options
    - Enhanced error handling and validation across all methods
    - Improved documentation and type definitions
- Updated Cosmos Translate API coverage:
    - Improved transaction processing and validation
    - Enhanced error handling with more specific error types
    - Updated documentation with detailed examples

### Fixed
- Fixed address validation in Cosmos Translate API
- Improved error handling for invalid chain names
- Fixed pagination issues in transaction history retrieval


## [1.0.6] - 2025-05-08

### Added
- New Cosmos Translate API implementation:
    - Comprehensive test coverage for Cosmos Translate functionality
    - Detailed documentation for Cosmos Translate API
    - Example implementations for Cosmos Translate API usage
    - New utility functions for Cosmos address validation
    - New error types for Cosmos-specific operations

### Changed
- Improved overall documentation structure
- Enhanced error handling across the SDK


## [1.0.5] - 2025-05-08

### Changed
- Updated token balance tests to be more resilient to API response changes
- Made `usdValue` field validation optional in token balance responses
- Improved test coverage for EVM, SVM, TVM, and UTXO translate modules

### Added
- New `getTxTypes` method to retrieve available transaction types from the EVM Translate API


## [1.0.4] - 2025-04-18

### Fixed
- Fixed `getTokenBalances` method to handle different response formats correctly
- Updated tests to match actual API behavior
- Updated documentation to accurately reflect current implementation