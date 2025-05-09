# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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