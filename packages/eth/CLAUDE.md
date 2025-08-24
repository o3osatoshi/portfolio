# CLAUDE.md - ETH Package

This file provides guidance for the `@repo/eth` package - Web3/Ethereum contract integration utilities.

## Package Overview

The ETH package provides Web3/Ethereum blockchain integration utilities using Wagmi v2, with generated contract types and interaction helpers.

## Package Structure

- **src/generated.ts**: Auto-generated contract types and hooks from Wagmi CLI
- **wagmi.config.ts**: Wagmi configuration for contract generation

## Key Features

### Contract Integration
- **Type-Safe Contracts**: Auto-generated TypeScript types for smart contracts
- **React Hooks**: Generated Wagmi hooks for contract interactions
- **ABI Management**: Centralized contract ABI definitions

### Wagmi v2 Integration
- **Modern Web3 Stack**: Uses latest Wagmi v2 (canary) with Viem
- **React Hooks**: Contract read/write hooks with caching and error handling
- **Network Support**: Configured for multiple blockchain networks

## Development Commands

**Generate contract types:**
```bash
pnpm generate    # Run Wagmi CLI to generate contract types
```

**Build the package:**
```bash
pnpm build       # Build with TypeScript compiler
pnpm dev         # Watch mode for development
```

**Testing:**
```bash
pnpm test        # Run Web3 integration tests
```

## Configuration

### wagmi.config.ts
- **Contract Sources**: Define contract addresses and ABIs
- **Code Generation**: Configure TypeScript and React hook generation
- **Network Settings**: Specify supported blockchain networks

### Generated Code
- **Contract Hooks**: `useContractRead`, `useContractWrite` hooks
- **Type Definitions**: TypeScript interfaces for contract methods
- **Event Hooks**: Hooks for listening to contract events

## Integration with Applications

### Usage in React Components
```typescript
// Import generated hooks
import { useContractRead, useContractWrite } from "@repo/eth";

// Use in React components with full type safety
const { data, isLoading } = useContractRead({
  address: contractAddress,
  functionName: 'methodName',
  args: [param1, param2]
});
```

### Web3 Provider Setup
- Applications need WalletConnect configuration
- RainbowKit integration for wallet connection UI
- Proper network configuration for the target blockchain

## Network Configuration

### Supported Networks
- Configure networks in the host application's Wagmi config
- Testnet support (Holesky, Sepolia, etc.)
- Mainnet configuration for production

### Environment Variables
- `NEXT_PUBLIC_PROJECT_ID`: WalletConnect project ID
- Network-specific RPC URLs if needed

## Package Configuration

- **Type**: ESM module with React hooks
- **Dependencies**: Wagmi v2 (canary), Viem for Ethereum interactions
- **Build**: TypeScript compilation with proper React JSX support
- **Code Generation**: Wagmi CLI for contract type generation

## Important Notes

- **Contract Changes**: Re-run `pnpm generate` after contract updates
- **Network Dependencies**: Host applications must configure Web3 providers
- **Type Safety**: Generated types ensure compile-time contract validation
- **React Required**: Package is designed for React applications with hooks