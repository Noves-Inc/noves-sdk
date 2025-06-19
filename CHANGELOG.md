# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.4] - 2025-06-19

### Added
- **TVM Translate API Balance Job functionality**:
  - New `startBalancesJob(chain, tokenAddress, accountAddress, blockNumber)` method for initiating async balance calculations
  - New `getBalancesJobResults(chain, jobId)` method for retrieving balance job results with polling support
  - Comprehensive error handling for 425 status codes when jobs are still processing
  - Support for historic token balance queries at specific block numbers
- **New TVM Balance Job type definitions**:
  - New `TVMTranslateStartBalanceJobResponse` interface for job initiation responses
  - New `TVMTranslateBalanceJobResult` interface for balance job results
  - New `TVMTranslateBalanceToken` interface for token information in balance results
  - New `TVMTranslateStartBalanceJobParams` interface for method parameters
  - All types precisely match actual API responses for 100% type safety
- **Enhanced TVM API documentation**:
  - Comprehensive API documentation for both new balance job methods
  - Detailed examples with polling patterns and error handling
  - Response format specifications with exact type definitions
  - Usage examples for 425 status code handling and retry logic
- **Updated TVM examples and test coverage**:
  - Added balance job examples to `docs/examples/translate/tvm.ts`
  - Comprehensive test coverage with mock responses matching actual API structure
  - Tests for success scenarios, error handling, and 425 status processing
  - End-to-end validation with real API endpoints

## [1.1.3] - 2025-06-12

### Added
- **Enhanced cursor-based pagination with stateless navigation metadata**:
  - New `CursorNavigationMeta` interface for embedding navigation context within cursors
  - New `EnhancedCursorData` interface for self-contained cursor data structures
  - Enhanced cursors now include complete navigation history and bidirectional navigation capabilities
  - Cursors are now fully stateless and contain all necessary context for external pagination systems
- **Advanced cursor methods for external pagination control**:
  - Enhanced `getCursorInfo()` method returns comprehensive cursor metadata including navigation availability
  - Enhanced `getNextCursor()` and `getPreviousCursor()` methods return Base64-encoded enhanced cursors
  - Enhanced `TransactionsPage.fromCursor()` static method supports both legacy and enhanced cursor formats
  - Enhanced `TransactionsPage.decodeCursor()` static method with support for enhanced cursor structures
- **Comprehensive test coverage for enhanced cursor functionality**:
  - Added extensive test suite for enhanced cursor navigation in EVM Translate API
  - Added comprehensive test suite for enhanced cursor functionality in SVM Translate API
  - Tests validate cursor encoding/decoding, navigation integrity, and bidirectional page consistency
  - Tests ensure backward compatibility with existing cursor implementations

### Changed
- **Enhanced cursor implementation with backward compatibility**:
  - Updated `Pagination` base class with enhanced cursor generation and navigation metadata
  - Enhanced cursor encoding now includes navigation history, page indices, and bidirectional navigation flags
  - Improved cursor decoding to handle both legacy PageOptions and enhanced cursor data structures
  - Enhanced navigation logic with improved state management and history tracking
- **Improved pagination reliability and consistency**:
  - Enhanced page navigation with better error handling and state validation
  - Improved cursor-based navigation with comprehensive metadata for external systems
  - Enhanced bidirectional navigation with guaranteed page consistency across forward/backward traversal
- **Updated type definitions for enhanced cursor support**:
  - Extended common types with new cursor navigation interfaces
  - Enhanced type safety for cursor operations and navigation metadata
  - Improved type definitions for enhanced cursor data structures and navigation context

### Fixed
- Enhanced cursor navigation consistency ensuring identical page content when revisiting pages
- Improved cursor encoding/decoding reliability with comprehensive error handling
- Enhanced pagination state management with better navigation history tracking

## [1.1.2] - 2025-06-11

### Added
- Enhanced pagination navigation with new `previous()` method:
  - New `previous()` method in `Pagination` base class for going back to previous pages
  - New `hasPrevious()` method to check if there's a previous page available
  - Enhanced navigation capabilities across all Translate APIs
- Async iterator support for all TransactionsPage objects:
  - Implemented `Symbol.asyncIterator` for seamless iteration through all transactions
  - Allows `for await (const tx of transactionsPage)` syntax
  - Automatically handles pagination while iterating
- **Cursor-based pagination support for advanced use cases with comprehensive documentation**:
  - New `getCursorInfo()` method returns cursor metadata with next/previous availability
  - New `getNextCursor()` and `getPreviousCursor()` methods return Base64-encoded cursor strings
  - New static `TransactionsPage.fromCursor()` method creates pages from cursor strings
  - New static `TransactionsPage.decodeCursor()` method for cursor string parsing
  - Enables external APIs to encode/decode pagination state without SDK dependency
- Enhanced URL parameter handling:
  - Added support for additional pagination parameters: `ignoreTransactions`, `pageKey`, `pageNumber`, `ascending`
  - Improved parameter parsing in `urlUtils.ts` for better pagination control
- Comprehensive example updates:
  - Updated all ecosystem examples (EVM, SVM, Cosmos, Polkadot, TVM, UTXO) with advanced pagination demonstrations
  - Added examples for `previous()` navigation and async iterator usage
  - Enhanced documentation with practical pagination scenarios

### Changed
- **Major pagination API improvements**:
  - **Cosmos Translate API**: Refactored `getTransactions` method to return `TransactionsPage` instead of raw API response
    - Maintains backward compatibility with deprecated `Transactions` method
    - Provides consistent pagination interface across all ecosystems
  - **Polkadot Translate API**: Refactored `getTransactions` method to return `TransactionsPage` instead of raw API response  
    - Maintains backward compatibility with deprecated `Transactions` method
    - Improved URL parsing for pagination parameters
- Enhanced `TransactionsPage` implementation:
  - Updated internal pagination logic to use `getTransactions` method instead of deprecated `Transactions`
  - Improved error handling and fallback mechanisms
  - Better state management for navigation history

- Updated documentation across all APIs:
  - Enhanced method descriptions with new pagination capabilities
  - Added comprehensive examples for advanced pagination use cases
  - Improved clarity on deprecated vs recommended methods
- Enhanced test coverage:
  - Added tests for `previous()` navigation functionality
  - Added tests for async iterator behavior
  - Updated existing tests to work with new `TransactionsPage` return types

## [1.1.1] - 2025-06-10

### Added
- Enhanced EVM Translate API `getTransaction` method:
  - New optional `viewAsAccountAddress` parameter for transaction perspective filtering
  - Allows viewing transactions from a specific wallet address perspective
  - Supports both v2 and v5 transaction format versions
  - Maintains backward compatibility with existing method signature
- Comprehensive test coverage for the new `viewAsAccountAddress` parameter:
  - Tests for v2 format with viewAsAccountAddress
  - Tests for v5 format with viewAsAccountAddress  
  - Tests for exact API parameter matching
- Updated documentation and examples:
  - Enhanced API documentation with new parameter details
  - Added practical usage examples with DSProxy contract perspective
  - Updated method signature documentation

### Changed
- Updated EVM Translate API implementation:
  - Enhanced URL construction logic to properly handle viewAsAccountAddress parameter
  - Improved parameter encoding for safe URL transmission
  - Added proper query parameter handling for both v2 and v5 formats

## [1.1.0] - 2025-06-06

### Added
- New UTXO Pricing API implementation:
  - New `PricingUTXO` class for UTXO chain pricing
  - New `getChains` method for retrieving supported UTXO chains
  - New `getPrice` method for token price retrieval with timestamp support
  - New documentation file for UTXO Pricing API
  - New examples directory with UTXO Pricing usage examples

### Changed
- **BREAKING CHANGE**: Major type system restructuring from monolithic to ecosystem-first organization:
  - Removed monolithic `src/types/types.ts` file
  - Restructured types into ecosystem-specific modules:
    - `src/types/common.ts` - Shared types across all ecosystems
    - `src/types/evm.ts` - EVM-specific types and interfaces
    - `src/types/svm.ts` - Solana Virtual Machine types
    - `src/types/cosmos.ts` - Cosmos ecosystem types
    - `src/types/polkadot.ts` - Polkadot ecosystem types
    - `src/types/tvm.ts` - TON Virtual Machine types
    - `src/types/utxo.ts` - Bitcoin and UTXO chain types
    - `src/types/move.ts` - Move ecosystem types
    - `src/types/index.ts` - Centralized type exports
- Enhanced type safety and organization across all APIs:
  - Updated all Translate APIs to use ecosystem-specific types
  - Updated all Pricing APIs to use ecosystem-specific types  
  - Updated Foresight API to use new type system
  - Improved import paths and type consistency
- Enhanced API implementations:
  - Updated EVM Translate API with improved type safety
  - Updated SVM Translate API with ecosystem-specific types
  - Updated UTXO Translate API with enhanced functionality
  - Updated TVM, Cosmos, and Polkadot APIs with new type system
  - Updated all Pricing APIs with consistent type usage
  - Enhanced Foresight API with improved type definitions
- Improved utility functions:
  - Enhanced `apiUtils.ts` with better type handling
  - Updated `urlUtils.ts` with improved parameter handling
  - Streamlined `cosmosUtils.ts` removing deprecated functions
- Updated documentation and examples:
  - Comprehensive updates to all API documentation files
  - Updated all example files to use new type system
  - Enhanced code examples with better type safety
- Updated test coverage:
  - Comprehensive test updates across all modules
  - Enhanced test assertions with new type system
  - Improved test reliability and maintainability

### Fixed
- Resolved type inconsistencies across different ecosystems
- Fixed import path issues with the new type organization
- Improved type safety in API responses and requests
- Enhanced error handling with ecosystem-specific type validation

## [1.0.24] - 2025-05-30

### Changed
- Enhanced transaction handling across multiple ecosystems:
  - Updated EVM Translate API:
    - Improved `getTransaction` method with v2 and v5 format support
    - Added format version parameter for transaction retrieval
    - Enhanced validation for transaction response formats
  - Updated SVM Translate API:
    - Added v4 and v5 format support for `getTransaction` method
    - Improved source and classification data handling
    - Enhanced error handling for transaction responses
  - Updated TVM Translate API:
    - Simplified `getTransaction` method implementation
    - Removed deprecated methods and improved error handling
  - Updated UTXO Translate API:
    - Improved `getTransaction` method parameter naming
    - Enhanced error handling for transaction validation
  - Updated Polkadot Translate API:
    - Removed deprecated methods
    - Improved transaction handling and validation
- Improved type definitions:
  - Updated transaction interfaces for better type safety
  - Renamed `TransactionV4` to `TransactionV2` for consistency
  - Enhanced validation for transaction response formats
- Enhanced test coverage:
  - Added comprehensive tests for transaction format versions
  - Improved error handling test cases
  - Updated test assertions for new transaction formats

## [1.0.23] - 2025-05-29

### Changed
- Enhanced token balance handling across multiple ecosystems:
  - Updated EVM Translate API:
    - Improved `getTokenBalances` method implementation
    - Removed incorrect methods
  - Updated SVM Translate API:
    - Enhanced `getTokenBalances` method
  - Updated UTXO Translate API:
    - Fixed `getTokenBalances` method
    - Improved chain and transaction handling
  - Updated Cosmos Translate API:
    - Enhanced `getTokenBalances` method
- Fixed TVM Translate tests for better reliability
- Improved UTXO Translate methods:
  - Enhanced chain handling
  - Fixed transaction-related functionality

## [1.0.22] - 2025-05-27

### Changed
- Enhanced transaction format handling in EVM Translate API:
  - Updated `TransactionV5` interface structure:
    - Moved `transfers` field to top level from `classificationData`
    - Improved type safety for transaction format validation
  - Updated validation logic in `getTransaction` method:
    - Added validation for top-level `transfers` field
    - Removed `transfers` validation from `classificationData`
  - Updated test cases to match new transaction format structure:
    - Added assertions for top-level `transfers` field
    - Removed assertions for nested `transfers` in `classificationData`

## [1.0.21] - 2025-05-26

### Changed
- Enhanced transaction format handling across Translate APIs:
  - Updated EVM Translate API `getTransaction` method:
    - Added support for both v4 and v5 transaction formats
    - Improved type safety with separate `TransactionV4` and `TransactionV5` interfaces
    - Enhanced validation for format-specific fields
  - Updated SVM Translate API `Transactions` method:
    - Added support for v4 and v5 format selection via `v5Format` parameter
    - Improved endpoint construction for format-specific requests
  - Enhanced `PageOptions` interface:
    - Added detailed documentation for chain-specific options
    - Clarified which options are applicable to EVM vs SVM chains
    - Improved type safety for format-related parameters
  - Updated test cases to match new transaction format structure

## [1.0.20] - 2025-05-26

### Changed
- Updated transaction format handling in Translate API:
  - Modified EVM Translate API `Transactions` method:
    - Changed format handling to use `v5Format` boolean parameter
  - Modified SVM Translate API `Transactions` method:
    - Removed format parameter as it's not supported by the API
  - Updated `PageOptions` interface:
    - Replaced `format` option with `v5Format` boolean for EVM chains
    - Updated documentation to reflect correct API behavior
- Enhanced type safety in pagination:
  - Made `getNextPageKeys()` return type explicit as `PageOptions | null` in all pagination classes
  - Updated documentation to clearly indicate possible return values
  - Improved type consistency across `Pagination`, `TransactionsPage`, and `HistoryPage` classes

## [1.0.19] - 2025-05-23

### Changed
- Enhanced token balance validation across all ecosystems:
  - Updated EVM Translate API `getTokenBalances` method:
    - Improved validation for token balance response format
    - Added support for optional `usdValue` field
    - Enhanced error handling for invalid token data
  - Updated SVM Translate API `getTokenBalances` method:
    - Fixed validation to handle null `usdValue` fields
    - Improved response type consistency
    - Enhanced error handling for malformed responses
  - Updated Cosmos Translate API `getTokenBalances` method:
    - Added validation for required `icon` field in token data
    - Improved response type consistency
    - Enhanced error handling for invalid addresses

### Fixed
- Fixed token balance validation in all ecosystems:
  - Corrected response type definitions to match API behavior
  - Updated validation logic to handle optional fields properly
  - Improved error messages for better debugging
  - Fixed test cases to match actual API responses

## [1.0.18] - 2025-05-16

### Added
- New utility function `shortenAddress` for formatting blockchain addresses

## [1.0.17] - 2025-05-16

### Fixed
- Fixed transaction validation in EVM Translate API:
  - Updated validation to check for correct fields in v5 format response
  - Fixed validation to properly handle nested transaction data structure
  - Improved error handling for transaction validation failures

## [1.0.16] - 2025-05-15

### Added
- Enhanced Move Pricing API coverage:
    - New `PricingMove` class for Move ecosystem pricing
    - New `getChains` method for retrieving supported Move chains
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

