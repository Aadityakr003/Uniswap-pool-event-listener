const { ethers } = require('ethers');
require('dotenv').config();

// const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/9a90988b9f5542a8ac3d180d1c915fbc');
const provider = new ethers.WebSocketProvider(process.env.INFURA_WSS);

const poolAddress = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';

const poolAbi = [
  "event Swap(address indexed sender, address indexed recipient,int256 amount0,int256 amount1,uint160 sqrtPriceX96,uint128 liquidity,int24 tick)"
];

const poolContract = new ethers.Contract(poolAddress, poolAbi, provider);

async function fetchLatestSwaps() {
  try {
    console.log('Listening for swap events for USDC / ETH...');

    // Listen for Swap events
    poolContract.on('Swap', async (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick, event) => {  
        
      const block = await provider.getBlock(event.log.blockNumber);
      const timestamp = new Date(block.timestamp * 1000).toISOString();
    let type;
    let ethAmount, usdcAmount;

    if (amount1 > 0) {
      type = 'Buy USDC';
      ethAmount = ethers.formatUnits(amount1, 18);  
      usdcAmount = ethers.formatUnits(amount0, 6);  
    } else {
      type = 'Sell USDC';
      ethAmount = ethers.formatUnits(amount1, 18); 
      usdcAmount = ethers.formatUnits(amount0, 6); 
    }

      console.log('-----------------------------------');
      console.log(`Time: ${timestamp.toString()}`);
      console.log(`Transaction Hash: ${event.log.transactionHash}`);
      console.log(`Type of Transaction: ${type}`);
      console.log(`ETH Amount: ${ethAmount}`);
      console.log(`USDC Amount: ${usdcAmount}`);
      console.log('-----------------------------------');

    });
  } catch (error) {
    console.error('Error fetching swap events:', error);
  }
}

fetchLatestSwaps();
