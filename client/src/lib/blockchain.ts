
import { ethers } from "ethers";

const LENDING_POOL_ABI = [
  "function deposit(address token, uint256 amount)",
  "function withdraw(address token, uint256 amount)",
  "function borrow(address token, uint256 amount, address collateralToken)",
  "function repay(address token, uint256 amount)",
  "function getUserDeposit(address user, address token) view returns (uint256)",
  "function getUserBorrowing(address user, address token) view returns (uint256)"
];

const LENDING_POOL_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

export async function lendAsset(assetAddress: string, amount: string) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const lendingPool = new ethers.Contract(LENDING_POOL_ADDRESS, LENDING_POOL_ABI, signer);
  const token = new ethers.Contract(assetAddress, ["function approve(address spender, uint256 amount)"], signer);
  
  // Approve token spending
  await token.approve(LENDING_POOL_ADDRESS, ethers.parseEther(amount));
  
  // Deposit into lending pool
  const tx = await lendingPool.deposit(assetAddress, ethers.parseEther(amount));
  await tx.wait();
  
  return tx;
}

export async function borrowAsset(assetAddress: string, amount: string, collateralAddress: string) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  // Contract calls would go here
  // This would interact with lending protocol smart contracts
  return null;
}

export async function getGasPrice() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getFeeData();
}
