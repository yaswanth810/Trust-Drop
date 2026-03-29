// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TrustDropNFT 
 * @dev ERC-721 NFT badges for donors on TrustDrop
 */
contract TrustDropNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    enum BadgeTier { Bronze, Silver, Gold, Platinum }

    struct DonorInfo {
        uint256 totalDonated;
        uint256 campaignsSupported;
        BadgeTier highestTier;
        uint256[] tokenIds;
        bool exists;
    }

    mapping(address => DonorInfo) public donors;
    mapping(uint256 => BadgeTier) public tokenTier;

    // Tier thresholds in wei
    uint256 public constant BRONZE_THRESHOLD = 0.01 ether;
    uint256 public constant SILVER_THRESHOLD = 0.05 ether;
    uint256 public constant GOLD_THRESHOLD = 0.1 ether;
    uint256 public constant PLATINUM_THRESHOLD = 0.5 ether;

    event BadgeMinted(address indexed donor, uint256 tokenId, BadgeTier tier);
    event DonationTracked(address indexed donor, uint256 totalDonated);

    constructor() ERC721("TrustDrop Supporter", "TDROP") Ownable(msg.sender) {}

    /**
     * @dev Track a donation and auto-mint badge if threshold met
     * @param donor The donor address
     * @param amount The donation amount in wei
     * @param campaignId The campaign ID donated to
     */
    function trackDonation(
        address donor, 
        uint256 amount,
        uint256 campaignId
    ) external onlyOwner {
        DonorInfo storage info = donors[donor];
        
        if (!info.exists) {
            info.exists = true;
        }

        info.totalDonated += amount;
        info.campaignsSupported++;

        emit DonationTracked(donor, info.totalDonated);

        // Check for badge upgrades
        _checkAndMintBadge(donor);
    }

    /**
     * @dev Mint a badge NFT for a donor
     */
    function mintBadge(
        address donor, 
        BadgeTier tier, 
        string memory uri
    ) external onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(donor, tokenId);
        _setTokenURI(tokenId, uri);
        tokenTier[tokenId] = tier;

        donors[donor].tokenIds.push(tokenId);
        if (tier > donors[donor].highestTier) {
            donors[donor].highestTier = tier;
        }

        emit BadgeMinted(donor, tokenId, tier);
    }

    /**
     * @dev Internal: check if donor qualifies for a new badge tier
     */
    function _checkAndMintBadge(address donor) internal {
        DonorInfo storage info = donors[donor];
        BadgeTier newTier;
        bool shouldMint = false;

        if (info.totalDonated >= PLATINUM_THRESHOLD && info.highestTier < BadgeTier.Platinum) {
            newTier = BadgeTier.Platinum;
            shouldMint = true;
        } else if (info.totalDonated >= GOLD_THRESHOLD && info.highestTier < BadgeTier.Gold) {
            newTier = BadgeTier.Gold;
            shouldMint = true;
        } else if (info.totalDonated >= SILVER_THRESHOLD && info.highestTier < BadgeTier.Silver) {
            newTier = BadgeTier.Silver;
            shouldMint = true;
        } else if (info.totalDonated >= BRONZE_THRESHOLD && info.highestTier < BadgeTier.Bronze) {
            newTier = BadgeTier.Bronze;
            shouldMint = true;
        }

        // Note: actual minting with URI is done via mintBadge() called from frontend
        // This just tracks eligibility
        if (shouldMint) {
            info.highestTier = newTier;
        }
    }

    /**
     * @dev Get all badge token IDs for a donor
     */
    function getBadges(address donor) external view returns (uint256[] memory) {
        return donors[donor].tokenIds;
    }

    /**
     * @dev Get donor info
     */
    function getDonorInfo(address donor) external view returns (
        uint256 totalDonated,
        uint256 campaignsSupported,
        BadgeTier highestTier,
        uint256 badgeCount
    ) {
        DonorInfo memory info = donors[donor];
        return (
            info.totalDonated,
            info.campaignsSupported,
            info.highestTier,
            info.tokenIds.length
        );
    }

    /**
     * @dev Get tier name as string
     */
    function getTierName(BadgeTier tier) external pure returns (string memory) {
        if (tier == BadgeTier.Bronze) return "Bronze Supporter";
        if (tier == BadgeTier.Silver) return "Silver Supporter";
        if (tier == BadgeTier.Gold) return "Gold Supporter";
        if (tier == BadgeTier.Platinum) return "Platinum Guardian";
        return "Unknown";
    }
}
