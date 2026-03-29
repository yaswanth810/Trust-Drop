import { ethers } from 'ethers';

/**
 * Shorten an Ethereum address
 */
export function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format ETH value from wei BigInt
 */
export function formatEth(weiValue) {
  if (!weiValue) return '0';
  try {
    return parseFloat(ethers.formatEther(weiValue)).toFixed(4);
  } catch {
    return '0';
  }
}

/**
 * Format ETH with symbol
 */
export function formatEthWithSymbol(weiValue) {
  return `${formatEth(weiValue)} ETH`;
}

/**
 * Format a Unix timestamp to readable date
 */
export function formatDate(timestamp) {
  if (!timestamp) return 'No deadline';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a Unix timestamp to relative time
 */
export function timeAgo(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(timestamp);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(raised, total) {
  if (!total || total === BigInt(0)) return 0;
  try {
    const raisedNum = parseFloat(ethers.formatEther(raised));
    const totalNum = parseFloat(ethers.formatEther(total));
    if (totalNum === 0) return 0;
    return Math.min(Math.round((raisedNum / totalNum) * 100), 100);
  } catch {
    return 0;
  }
}

/**
 * Get milestone status label and style
 */
export function getMilestoneStatus(milestone) {
  if (milestone.fundsReleased) {
    return { label: 'Funds Released', className: 'badge-released' };
  }
  if (milestone.isApproved) {
    return { label: 'Approved', className: 'badge-approved' };
  }
  if (milestone.isRejected) {
    return { label: 'Rejected', className: 'badge-rejected' };
  }
  if (milestone.ipfsHash && milestone.ipfsHash.length > 0) {
    return { label: 'Proof Submitted', className: 'badge-submitted' };
  }
  return { label: 'Pending', className: 'badge-pending' };
}

/**
 * Get Etherscan URL for a transaction
 */
export function getEtherscanUrl(txHash) {
  const baseUrl = import.meta.env.VITE_ETHERSCAN_BASE_URL || 'https://sepolia.etherscan.io/tx/';
  return `${baseUrl}${txHash}`;
}

/**
 * Get Etherscan URL for an address
 */
export function getEtherscanAddressUrl(address) {
  return `https://sepolia.etherscan.io/address/${address}`;
}

/**
 * Validate ETH amount string
 */
export function isValidEthAmount(amount) {
  if (!amount || amount === '') return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
