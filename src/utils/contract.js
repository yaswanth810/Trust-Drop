import { ethers } from 'ethers';

/**
 * Get all campaigns from the contract
 */
export async function getAllCampaigns(contract) {
  try {
    const count = await contract.getCampaignCount();
    const campaigns = [];

    for (let i = 0; i < Number(count); i++) {
      const campaign = await getCampaignById(contract, i);
      if (campaign) campaigns.push(campaign);
    }

    return campaigns;
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    return [];
  }
}

/**
 * Get single campaign by ID — uses split getter functions
 */
export async function getCampaignById(contract, campaignId) {
  try {
    // Fetch basic info and funds info in parallel
    const [basic, funds] = await Promise.all([
      contract.getCampaignBasic(campaignId),
      contract.getCampaignFunds(campaignId),
    ]);

    const milestoneCount = Number(funds[2]);
    const milestones = await getMilestones(contract, campaignId, milestoneCount);

    return {
      campaignId: Number(basic[0]),
      ngoAddress: basic[1],
      title: basic[2],
      description: basic[3],
      totalFunds: funds[0],
      raisedFunds: funds[1],
      milestoneCount,
      isActive: funds[3],
      isFrozen: funds[4],
      milestones,
    };
  } catch (err) {
    console.error(`Error fetching campaign ${campaignId}:`, err);
    return null;
  }
}

/**
 * Get milestones for a campaign
 */
export async function getMilestones(contract, campaignId, count) {
  const milestones = [];

  for (let i = 0; i < count; i++) {
    try {
      const m = await contract.getMilestone(campaignId, i);
      milestones.push({
        index: i,
        description: m[0],
        fundAmount: m[1],
        ipfsHash: m[2],
        approvalCount: Number(m[3]),
        isApproved: m[4],
        isRejected: m[5],
        deadline: Number(m[6]),
        fundsReleased: m[7],
      });
    } catch (err) {
      console.error(`Error fetching milestone ${i} for campaign ${campaignId}:`, err);
    }
  }

  return milestones;
}

/**
 * Donate to a campaign
 */
export async function donateToCampaign(contract, campaignId, amountInEth) {
  const tx = await contract.donate(campaignId, {
    value: ethers.parseEther(amountInEth),
  });
  return tx;
}

/**
 * Create a new campaign
 */
export async function createNewCampaign(contract, title, description, milestoneDescs, milestoneAmounts, milestoneDeadlines) {
  const amounts = milestoneAmounts.map((a) => ethers.parseEther(a));
  const deadlines = milestoneDeadlines.map((d) => Math.floor(new Date(d).getTime() / 1000));

  const tx = await contract.createCampaign(title, description, milestoneDescs, amounts, deadlines);
  return tx;
}

/**
 * Submit milestone proof
 */
export async function submitProof(contract, campaignId, milestoneIndex, ipfsHash) {
  const tx = await contract.submitMilestoneProof(campaignId, milestoneIndex, ipfsHash);
  return tx;
}

/**
 * Approve a milestone
 */
export async function approveMilestone(contract, campaignId, milestoneIndex) {
  const tx = await contract.approveMilestone(campaignId, milestoneIndex);
  return tx;
}

/**
 * Register as validator
 */
export async function registerAsValidator(contract) {
  const tx = await contract.registerValidator({
    value: ethers.parseEther('0.01'),
  });
  return tx;
}

/**
 * Get donation amount for a specific donor in a campaign
 */
export async function getDonationAmount(contract, campaignId, donorAddress) {
  try {
    const amount = await contract.getDonation(campaignId, donorAddress);
    return amount;
  } catch (err) {
    console.error('Error fetching donation:', err);
    return BigInt(0);
  }
}

/**
 * Check if address is a validator
 */
export async function checkIsValidator(contract, address) {
  try {
    return await contract.isValidator(address);
  } catch (err) {
    return false;
  }
}

/**
 * Get platform statistics
 */
export async function getPlatformStats(contract) {
  try {
    const [totalDonated, campaignCount, milestonesCompleted] = await Promise.all([
      contract.totalDonated(),
      contract.getCampaignCount(),
      contract.totalMilestonesCompleted(),
    ]);

    return {
      totalDonated: ethers.formatEther(totalDonated),
      campaignCount: Number(campaignCount),
      milestonesCompleted: Number(milestonesCompleted),
    };
  } catch (err) {
    console.error('Error fetching stats:', err);
    return { totalDonated: '0', campaignCount: 0, milestonesCompleted: 0 };
  }
}

/**
 * Get donors for a campaign
 */
export async function getCampaignDonors(contract, campaignId) {
  try {
    return await contract.getDonors(campaignId);
  } catch (err) {
    console.error('Error fetching donors:', err);
    return [];
  }
}
