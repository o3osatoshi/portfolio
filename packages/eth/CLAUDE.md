# CLAUDE.md - ETH Package

This file provides guidance for the `@repo/eth` package - Web3/Ethereum contract integration utilities with auto-generated types and ABIs.

## Package Overview

The ETH package provides Web3/Ethereum blockchain integration utilities using Wagmi CLI for code generation, with type-safe contract interactions and ABI management. This is a publishable package that exports generated contract types and ABIs.

## Package Structure

- **src/generated.ts**: Auto-generated contract ABIs and types from Wagmi CLI
- **src/index.ts**: Package entry point exporting generated contracts
- **wagmi.config.ts**: Wagmi CLI configuration for contract generation
- **tsup.config.mjs**: Build configuration for dual ESM/CJS output

## Code Generation

### Wagmi Configuration
The `wagmi.config.ts` defines contract sources and generation settings:
- **ERC20 Contract**: Standard ERC20 ABI included
- **WETH Contract**: Wrapped Ether contract from Etherscan API
- **Etherscan Plugin**: Fetches contract ABIs directly from Etherscan

### Generated Content
- **Contract ABIs**: Type-safe contract interfaces
- **Address Constants**: Mainnet contract addresses
- **Type Definitions**: TypeScript types for contract methods

## Development Commands

**Generate contract types:**
```bash
pnpm generate    # Run Wagmi CLI with .env.local environment variables
```

**Build the package:**
```bash
pnpm build       # Build with tsup for dual ESM/CJS output
pnpm dev         # Watch mode for development
pnpm clean       # Remove dist directory
```

**Type checking:**
```bash
pnpm typecheck   # TypeScript type checking
```

**Publishing:**
```bash
pnpm prepublishOnly  # Full build pipeline: clean + generate + typecheck + build
```

## Environment Variables

### Required Variables
- **ETHERSCAN_API_KEY**: Required for fetching contract ABIs from Etherscan
- Set in `.env.local` file for development

### Configuration
```bash
# .env.local
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Contract Configuration

### Current Contracts
- **ERC20**: Standard token interface using Viem's built-in ABI
- **WETH**: Wrapped Ether contract on Ethereum mainnet
  - Address: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`
  - Fetched via Etherscan plugin

### Adding New Contracts
```typescript
// In wagmi.config.ts
export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "MyContract",
      abi: contractAbi,
    },
  ],
  plugins: [
    etherscan({
      apiKey,
      chainId: mainnet.id,
      contracts: [
        {
          name: "MyContract",
          address: {
            [mainnet.id]: "0x...",
          },
        },
      ],
    }),
  ],
});
```

## Package Publication

- **Public Package**: Published to npm as `@repo/eth`
- **Dual Format**: Supports both ESM (`import`) and CommonJS (`require`)
- **Type Definitions**: Includes TypeScript declaration files
- **Files**: Publishes `dist/`, `README.md`, and `LICENSE`
- **Access**: Public access on npm registry

## Dependencies

- **Development Only**: All dependencies are devDependencies
- **Code Generation**: `@wagmi/cli`, `wagmi`, `viem` for contract interaction
- **Build Tools**: `@o3osatoshi/config`, `tsup`, `typescript`
- **Environment**: `dotenv-cli` for environment variable management
- **Node.js**: Requires Node.js >= 22 (specified in engines)

## Usage in Applications

### Installation
```bash
pnpm add @repo/eth
```

### Importing Generated Content
```typescript
// Import contract ABIs and addresses
import { wethAbi, erc20Abi } from "@repo/eth";

// Use with Wagmi hooks in React applications
import { useReadContract } from "wagmi";

const { data } = useReadContract({
  abi: wethAbi,
  address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  functionName: "name",
});
```

## Build Configuration

- **Dual Output**: ESM and CommonJS formats
- **Type Definitions**: Includes .d.ts files
- **Tree Shaking**: Side-effect free for optimal bundling
- **Modern Target**: ES2022 with Node.js compatibility

## Important Notes

- **Generation First**: Always run `pnpm generate` before building
- **Environment Required**: ETHERSCAN_API_KEY must be set for generation
- **Type Safety**: All contract interactions are fully type-safe
- **Framework Agnostic**: Generated ABIs can be used with any Web3 library
- **Mainnet Focus**: Currently configured for Ethereum mainnet contracts
- **Auto-Generated Code**: Never edit `src/generated.ts` manually
- **Publishing Ready**: Includes full npm publication setup