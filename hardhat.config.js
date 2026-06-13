import "dotenv/config";

// Default placeholder key for compilation if .env is not yet set up
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xabc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1";
const CELO_RPC_URL = process.env.CELO_RPC_URL || "https://forno.celo.org";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    celo: {
      type: "http",
      url: CELO_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 42220,
    },
    alfajores: {
      type: "http",
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [PRIVATE_KEY],
      chainId: 44787,
    }
  },
};
