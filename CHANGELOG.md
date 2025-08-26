# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.2] - 2025-08-26

### Fixed
- **Critical XRPL pagination bug - End-of-data validation error**: Fixed severe pagination issue in `TranslateXRPL.getTransactions()` where SDK incorrectly threw "Invalid response format" error when reaching the end of transaction data.
  - **Root cause**: SDK validation required `nextPageSettings` field to always be present, but XRPL API correctly omits this field when no more pages are available (end of pagination)
  - **Impact**: Users could not access complete transaction history as pagination failed with validation error when reaching final page
  - **Fix**: Made `nextPageSettings` validation optional, allowing proper end-of-data handling

## [1.3.1] - 2025-08-22

### Fixed
- **Critical XRPL pagination bug**: Fixed issue where different pages returned identical transaction data despite generating correct cursor values. The SDK now properly includes the `marker` parameter from XRPL API responses in subsequent pagination requests, ensuring each page returns unique transactions as expected.
- **Enhanced XRPL pagination support**: Added `marker` parameter to `PageOptions` interface and URL utilities to properly handle XRPL-specific pagination tokens.
- **Improved pagination examples**: Updated XRPL documentation examples to demonstrate both `next()` and cursor-based pagination methods, showing how the fix ensures different pages return different transactions.

### Technical Details
- Added `marker?: string` parameter to `PageOptions` interface for XRPL pagination support
- Updated `urlUtils.ts` to properly parse and construct URLs with `marker` parameter
- Modified `TranslateXRPL.getTransactions()` to extract and preserve `marker` from API response `nextPageSettings`
- Updated test expectations to account for default `sort=desc` parameter in URL construction

## [1.3.0] - 2025-08-21

### Added
- **Enhanced UTXO getAddressesByMasterKey endpoint with new parameters**:
  - `count` parameter: Number of addresses to derive from master key (1-10000). Default: 20
  - `addressType` parameter: Bitcoin address type to generate. Supports both numeric (0-3) and string values (Legacy/SegWit/SegWitP2SH/Taproot). Default: Legacy (0)
  - Support for different Bitcoin address types:
    - Legacy (0): Legacy P2PKH addresses starting with "1" - Most compatible, higher fees
    - SegWit (1): Native SegWit P2WPKH addresses starting with "bc1" - Lower fees, modern standard
    - SegWitP2SH (2): SegWit P2SH-P2WPKH addresses starting with "3" - Backward compatible SegWit
    - Taproot (3): Taproot P2TR addresses starting with "bc1p" - Enhanced privacy and flexibility
- **New TypeScript types**:
  - `BitcoinAddressType`: Union type supporting both numeric (0-3) and string values
  - `GetAddressesByMasterKeyOptions`: Options interface for address derivation parameters
- **Enhanced backward compatibility**:
  - Updated deprecated `getAddressesByXpub` method to support new parameters while maintaining backward compatibility
  - All existing API calls continue to work with default values (20 Legacy addresses)
- **Comprehensive validation**:
  - Count parameter validation (1-10000 range)
  - AddressType parameter validation (numeric 0-3 or string Legacy/SegWit/SegWitP2SH/Taproot)
  - Clear error messages for invalid parameters
- **Complete documentation and examples**:
  - Updated API documentation with detailed parameter descriptions and usage examples
  - Enhanced examples file with 9 comprehensive address derivation scenarios
  - API endpoint mapping examples showing query parameter usage
- **Extensive test coverage**:
  - 15+ new test cases covering all parameter combinations and validation scenarios
  - Tests for both numeric and string addressType values
  - Error validation and edge case testing
  - Backward compatibility testing for deprecated methods

## [1.2.1] - 2025-08-06

### Fixed
- **URL construction bug in pagination parameters**: Fixed critical issue in `constructUrl` function where the default `sort=desc` parameter was not being added to query strings when pageOptions were provided, causing "Invalid response format from API" errors in EVM Translate API calls with pagination parameters like `pageSize`.

## [1.2.0] - 2025-08-01

### Added
- **Complete XRPL (XRP Ledger) ecosystem support for Translate API**:
  - New `TranslateXRPL` class with full implementation of all 4 XRPL endpoints
  - `getChains()` - Returns list of supported XRPL chains with native coin information
  - `getTransaction(chain, txHash, viewAsAccountAddress?)` - Get single transaction with optional perspective view
  - `getTransactions(chain, accountAddress, pageOptions?)` - Get paginated transaction history with cursor-based navigation
  - `getTokenBalances(chain, accountAddress, includePrices?, ledgerIndex?, ledgerHash?)` - Get current/historical token balances with optional price data
  - Factory method: `Translate.xrpl(apiKey)` for easy instantiation
  - Direct class export: `TranslateXRPL` for advanced usage
- **Comprehensive XRPL type definitions** (`src/types/xrpl.ts):
  - `XRPLTranslateChain` - Chain information with tier and native coin details
  - `XRPLTranslateTransaction` - Complete transaction structure using `txTypeVersion: 6`
  - `XRPLTranslateToken` - Token information with XRPL-specific `issuer` field for issued tokens
  - `XRPLTranslateTransfer` - Transfer information for transaction analysis
  - `XRPLTranslateBalancesResponse` - Token balance response with timestamp and account info
  - `XRPLTransactionType` - Union type for XRPL transaction classifications
  - Full TypeScript support with proper interfaces for all API responses
- **Extensive documentation and examples**:
  - Complete API documentation (`docs/api/translate/xrpl.md`) with detailed method descriptions and usage examples
  - Comprehensive examples file (`docs/examples/translate/xrpl.ts`) with 10 practical use cases:
    - Basic chain and transaction retrieval
    - Pagination handling with proper method usage
    - Token balance tracking with historical support
    - Portfolio analysis and transaction categorization
    - Error handling demonstration
  - Updated main translate documentation to include XRPL ecosystem
- **Complete test coverage** (`tests/translate/translateXRPL.test.ts`):
  - 22 comprehensive test cases covering all methods and error scenarios
  - Full validation of API response structures and error handling
  - Mocked responses based on real XRPL API endpoint data
  - Edge case testing and validation error scenarios


## [1.1.7] - 2025-07-07

### Added
- **Enhanced error handling with structured error types and HTTP status codes**:
  - New `ErrorType` enum with predefined error categories (`JOB_NOT_FOUND`, `JOB_PROCESSING`, `JOB_NOT_READY`, `RATE_LIMIT_EXCEEDED`, `UNAUTHORIZED`, `INVALID_API_KEY`, `VALIDATION_ERROR`, `NETWORK_ERROR`, `UNKNOWN_ERROR`)
  - Enhanced `TransactionError` class with structured error categorization:
    - Added `errorType: ErrorType` property for type-safe error handling
    - Added `httpStatusCode?: number` property for HTTP status code access
    - Added `details?: any` property for additional error context
  - New convenience methods for common error checking:
    - `isJobNotFound()` - Check if job doesn't exist
    - `isJobProcessing()` - Check if job is still processing
    - `isRateLimited()` - Check if rate limited
    - `isUnauthorized()` - Check if authentication failed
    - `isErrorType(type)` - Check for specific error type
  - Enhanced `ApiResponse` interface with `httpStatusCode` and `errorType` properties
  - Updated all API clients to pass through HTTP status codes and structured error types
  - Comprehensive error handling documentation with migration guide from string comparisons to structured error types
- **Structured error mapping and constants**:
  - New `ERROR_MESSAGES` mapping for consistent error messages across error types
  - New `ERROR_STATUS_CODES` mapping from error types to HTTP status codes
  - Automatic error type detection based on API response patterns and HTTP status codes

### Changed
- **Improved error handling across all APIs**:
  - Enhanced `baseTranslate.ts` with structured error handling instead of string comparisons
  - Updated error creation to include error types and HTTP status codes
  - Legacy error message detection now maps to structured error types
  - Better error context with HTTP status codes and additional details
- **Enhanced API response structure**:
  - Updated `createTranslateClient`, `createForesightClient`, and `createPricingClient` to include HTTP status codes
  - Improved error response handling with structured error type assignment
  - Better error context preservation from API responses

### Fixed
- **Eliminated fragile string-based error detection**:
  - Replaced string comparisons like `msg.includes('does not exist')` with structured error types
  - Resolved issues with error handling when API error messages change
  - Improved reliability of job status detection (`JOB_NOT_FOUND` vs `JOB_PROCESSING`)
  - Enhanced error handling consistency across different API endpoints

## [1.1.6] - 2025-07-04

### Added
- **Explicit string union types for transaction classifications**: Added specific transaction type unions for all ecosystems (EVM, SVM, TVM, UTXO, Cosmos, Polkadot) replacing generic `string` types
- **Enhanced TypeScript autocomplete and type safety**: IDE now provides autocomplete for valid transaction types with compile-time validation
- **Pagination history limiting configuration**: New `maxNavigationHistory` parameter in `PageOptions` for controlling cursor-based pagination memory usage
  - Configurable limit for navigation history to prevent cursor growth (default: 10 pages)
  - Automatic cursor size monitoring with warnings when cursors exceed 5KB threshold
  - Enhanced cursor metadata with `originalPageIndex` and `historyStartIndex` for proper navigation state management

### Changed
- **Enhanced transaction type definitions**: Transaction types now reflect the types from each ecosystem
- **Improved type consistency across all Translate APIs**: All `DescribeTransaction` interfaces now use ecosystem-specific transaction types

### Fixed
- **Resolved 413 "Request Entity Too Large" errors in deep pagination**: Fixed cursor size growth issue that caused HTTP request failures after approximately 23 pages of navigation
  - Implemented navigation history limiting in enhanced cursor system to prevent unbounded cursor growth
  - Added automatic page key pruning in `TransactionsPage` and `HistoryPage` to maintain stable cursor sizes
  - Enhanced cursor creation logic to limit navigation history while preserving forward pagination capabilities
  - Cursor sizes now remain stable (typically 2-4KB) regardless of pagination depth
  - **Forward pagination remains unlimited** - users can navigate through thousands of pages without errors
  - **Backward navigation is limited** to the configured history size (default: 10 pages) but can be customized
  - Full backward compatibility maintained - existing code continues to work without modifications

## [1.1.5] - 2025-06-25

### Added
- **Enhanced TVM Translate API transaction format support**:
  - New `getTransaction` method with format parameter supporting both v2 and v5 transaction formats
  - Enhanced `getTransactions` method with `v5Format` parameter supporting both v2 and v5 transaction formats
  - Enhanced type definitions with `TVMTranslateTransactionV2` and `TVMTranslateTransactionV5` interfaces
  - New `TVMTranslateTransactionResponse` union type for handling both format versions
  - v5 format includes top-level `timestamp`, `transfers`, and `values` fields for improved data structure
  - v2 format maintains backward compatibility with nested transaction data in `classificationData`
  - Default format is v5 for `getTransaction` and v2 for `getTransactions` for backward compatibility
  - Comprehensive format validation ensuring API responses match requested transaction format versions
- **Enhanced UTXO Translate API transaction format support**:
  - New `getTransaction` method with `txTypeVersion` parameter supporting both v2 and v5 transaction formats
  - Enhanced `getTransactions` method with `v5Format` parameter supporting both v2 and v5 transaction formats
  - Enhanced type definitions with `UTXOTranslateTransactionV2` and `UTXOTranslateTransactionV5` interfaces
  - New address type definitions with `UTXOTranslateAddressV2` and `UTXOTranslateAddressV5` interfaces
  - New transfer type definitions with `UTXOTranslateTransferV2` and `UTXOTranslateTransferV5` interfaces
  - v5 format includes top-level `timestamp`, `transfers`, and `values` fields with enhanced address information
  - v2 format maintains backward compatibility with `sent`/`received` arrays in `classificationData`
  - Default format is v5 for `getTransaction` and v2 for `getTransactions` for backward compatibility
  - Comprehensive format validation ensuring API responses match requested transaction format versions


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
  - Renamed `