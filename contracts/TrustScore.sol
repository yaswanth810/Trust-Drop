// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TrustScore
 * @dev On-chain reputation engine for NGOs on TrustDrop
 */
contract TrustScore is Ownable {
    struct NGOStats {
        uint256 onTimeMilestones;
        uint256 lateMilestones;
        uint256 rejectedMilestones;
        uint256 completedCampaigns;
        uint256 totalMilestones;
        bool exists;
    }

    mapping(address => NGOStats) public ngoStats;
    address[] public registeredNGOs;

    event MilestoneTracked(address indexed ngo, bool onTime, uint256 newScore);
    event CampaignCompleted(address indexed ngo, uint256 newScore);
    event MilestoneRejected(address indexed ngo, uint256 newScore);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Track a milestone completion for an NGO
     * @param ngoAddress The NGO wallet address
     * @param onTime Whether the milestone was completed on time
     */
    function trackMilestoneCompletion(address ngoAddress, bool onTime) external onlyOwner {
        NGOStats storage stats = ngoStats[ngoAddress];
        
        if (!stats.exists) {
            stats.exists = true;
            registeredNGOs.push(ngoAddress);
        }

        stats.totalMilestones++;
        
        if (onTime) {
            stats.onTimeMilestones++;
        } else {
            stats.lateMilestones++;
        }

        emit MilestoneTracked(ngoAddress, onTime, calculateTrustScore(ngoAddress));
    }

    /**
     * @dev Track a rejected milestone
     * @param ngoAddress The NGO wallet address
     */
    function trackMilestoneRejection(address ngoAddress) external onlyOwner {
        NGOStats storage stats = ngoStats[ngoAddress];
        
        if (!stats.exists) {
            stats.exists = true;
            registeredNGOs.push(ngoAddress);
        }

        stats.totalMilestones++;
        stats.rejectedMilestones++;

        emit MilestoneRejected(ngoAddress, calculateTrustScore(ngoAddress));
    }

    /**
     * @dev Track a completed campaign
     * @param ngoAddress The NGO wallet address
     */
    function trackCampaignCompleted(address ngoAddress) external onlyOwner {
        NGOStats storage stats = ngoStats[ngoAddress];
        
        if (!stats.exists) {
            stats.exists = true;
            registeredNGOs.push(ngoAddress);
        }

        stats.completedCampaigns++;

        emit CampaignCompleted(ngoAddress, calculateTrustScore(ngoAddress));
    }

    /**
     * @dev Calculate trust score for an NGO (0-100)
     * Formula:
     *   +10 per on-time milestone
     *   +5 per late milestone
     *   -15 per rejected milestone
     *   +20 per completed campaign
     */
    function calculateTrustScore(address ngoAddress) public view returns (uint256) {
        NGOStats memory stats = ngoStats[ngoAddress];
        
        if (!stats.exists) return 0;

        int256 score = 0;
        score += int256(stats.onTimeMilestones) * 10;
        score += int256(stats.lateMilestones) * 5;
        score -= int256(stats.rejectedMilestones) * 15;
        score += int256(stats.completedCampaigns) * 20;

        // Clamp to 0-100
        if (score < 0) return 0;
        if (score > 100) return 100;
        
        return uint256(score);
    }

    /**
     * @dev Get trust score (alias for calculateTrustScore)
     */
    function getTrustScore(address ngoAddress) external view returns (uint256) {
        return calculateTrustScore(ngoAddress);
    }

    /**
     * @dev Get full NGO stats
     */
    function getNGOStats(address ngoAddress) external view returns (
        uint256 onTimeMilestones,
        uint256 lateMilestones,
        uint256 rejectedMilestones,
        uint256 completedCampaigns,
        uint256 totalMilestones,
        uint256 trustScore
    ) {
        NGOStats memory stats = ngoStats[ngoAddress];
        return (
            stats.onTimeMilestones,
            stats.lateMilestones,
            stats.rejectedMilestones,
            stats.completedCampaigns,
            stats.totalMilestones,
            calculateTrustScore(ngoAddress)
        );
    }

    /**
     * @dev Get total registered NGOs count
     */
    function getRegisteredNGOCount() external view returns (uint256) {
        return registeredNGOs.length;
    }
}
