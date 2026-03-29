import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

/**
 * Upload a file to IPFS via Pinata
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The IPFS CID (content hash)
 */
export async function uploadToIPFS(file) {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY || 
      PINATA_API_KEY === 'your_pinata_api_key') {
    throw new Error('Pinata API keys not configured. Please update .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: `TrustDrop-Proof-${Date.now()}`,
    keyvalues: {
      platform: 'TrustDrop',
      type: 'milestone-proof',
    },
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', options);

  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload file to IPFS. Please check your Pinata API keys.');
  }
}

/**
 * Get the IPFS gateway URL for a given hash
 * @param {string} hash - The IPFS CID
 * @returns {string} - The gateway URL
 */
export function getIPFSUrl(hash) {
  if (!hash) return '';
  // Handle both CIDv0 and CIDv1
  return `${PINATA_GATEWAY}${hash}`;
}

/**
 * Upload JSON metadata to IPFS
 * @param {Object} jsonData - The JSON data to upload
 * @returns {Promise<string>} - The IPFS CID
 */
export async function uploadJSONToIPFS(jsonData) {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY ||
      PINATA_API_KEY === 'your_pinata_api_key') {
    throw new Error('Pinata API keys not configured. Please update .env file.');
  }

  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: jsonData,
        pinataMetadata: {
          name: `TrustDrop-Metadata-${Date.now()}`,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('IPFS JSON upload error:', error);
    throw new Error('Failed to upload JSON to IPFS.');
  }
}
