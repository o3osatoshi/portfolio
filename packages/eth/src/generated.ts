//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WETH
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
 */
export const wethAbi = [
  {
    name: "name",
    constant: true,
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    name: "approve",
    constant: false,
    inputs: [
      { name: "guy", type: "address" },
      { name: "wad", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "totalSupply",
    constant: true,
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    name: "transferFrom",
    constant: false,
    inputs: [
      { name: "src", type: "address" },
      { name: "dst", type: "address" },
      { name: "wad", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "withdraw",
    constant: false,
    inputs: [{ name: "wad", type: "uint256" }],
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "decimals",
    constant: true,
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    name: "balanceOf",
    constant: true,
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    name: "symbol",
    constant: true,
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    name: "transfer",
    constant: false,
    inputs: [
      { name: "dst", type: "address" },
      { name: "wad", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "deposit",
    constant: false,
    inputs: [],
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    name: "allowance",
    constant: true,
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  { payable: true, stateMutability: "payable", type: "fallback" },
  {
    name: "Approval",
    anonymous: false,
    inputs: [
      { name: "src", indexed: true, type: "address" },
      { name: "guy", indexed: true, type: "address" },
      { name: "wad", indexed: false, type: "uint256" },
    ],
    type: "event",
  },
  {
    name: "Transfer",
    anonymous: false,
    inputs: [
      { name: "src", indexed: true, type: "address" },
      { name: "dst", indexed: true, type: "address" },
      { name: "wad", indexed: false, type: "uint256" },
    ],
    type: "event",
  },
  {
    name: "Deposit",
    anonymous: false,
    inputs: [
      { name: "dst", indexed: true, type: "address" },
      { name: "wad", indexed: false, type: "uint256" },
    ],
    type: "event",
  },
  {
    name: "Withdrawal",
    anonymous: false,
    inputs: [
      { name: "src", indexed: true, type: "address" },
      { name: "wad", indexed: false, type: "uint256" },
    ],
    type: "event",
  },
] as const;

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
 */
export const wethAddress = {
  1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
} as const;

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
 */
export const wethConfig = { abi: wethAbi, address: wethAddress } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// erc20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    name: "Approval",
    inputs: [
      { name: "owner", indexed: true, type: "address" },
      { name: "spender", indexed: true, type: "address" },
      { name: "value", indexed: false, type: "uint256" },
    ],
    type: "event",
  },
  {
    name: "Transfer",
    inputs: [
      { name: "from", indexed: true, type: "address" },
      { name: "to", indexed: true, type: "address" },
      { name: "value", indexed: false, type: "uint256" },
    ],
    type: "event",
  },
  {
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "name",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "symbol",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "totalSupply",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "transfer",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "transferFrom",
    inputs: [
      { name: "sender", type: "address" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
