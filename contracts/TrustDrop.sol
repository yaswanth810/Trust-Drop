// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TrustDrop is ReentrancyGuard, Ownable {
    
    // ============ Constants ============
    uint8 public constant APPROVAL_THRESHOLD = 3;
    uint256 public constant VALIDATOR_STAKE = 0.01 ether;

    // ============ Structs ============
    struct Milestone {
        string description;
        uint256 fundAmount;
        string ipfsHash;
        uint8 approvalCount;
        bool isApproved;
        bool isRejected;
        uint256 deadline;
        bool fundsReleased;
    }

    struct CampaignInfo {
        uint256 campaignId;
        address payable ngoAddress;
        string title;
        string description;
        uint256 totalFunds;
        uint256 raisedFunds;
        uint256 milestoneCount;
        bool isActive;
        bool isFrozen;
    }

    // ============ State Variables ============
    uint256 public campaignCount;
    
    mapping(uint256 => CampaignInfo) public campaigns;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasVoted;
    mapping(uint256 => address[]) public campaignDonors;
    mapping(uint256 => mapping(address => uint256)) public donations;
    
    mapping(address => bool) public validators;
    mapping(address => uint256) public validatorStakes;
    uint256 public validatorCount;

    uint256 public totalDonated;
    uint256 public totalMilestonesCompleted;

    // ============ Events ============
    event CampaignCreated(uint256 indexed campaignId, address indexed ngo, uint256 totalFunds);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event ProofSubmitted(uint256 indexed campaignId, uint256 milestoneIndex, string ipfsHash);
    event MilestoneApproved(uint256 indexed campaignId, uint256 milestoneIndex);
    event FundsReleased(uint256 indexed campaignId, uint256 milestoneIndex, uint256 amount);
    event DonorsRefunded(uint256 indexed campaignId, uint256 totalRefunded);
    event ValidatorRegistered(address indexed validator);
    event CampaignFrozen(uint256 indexed campaignId);

    // ============ Modifiers ============
    modifier onlyNGO(uint256 _campaignId) {
        require(campaigns[_campaignId].ngoAddress == msg.sender, "Only NGO can call this");
        _;
    }

    modifier onlyValidator() {
        require(validators[msg.sender], "Only registered validators can call this");
        _;
    }

    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId < campaignCount, "Campaign does not exist");
        _;
    }

    modifier campaignActive(uint256 _campaignId) {
        require(campaigns[_campaignId].isActive, "Campaign is not active");
        require(!campaigns[_campaignId].isFrozen, "Campaign is frozen");
        _;
    }

    // ============ Constructor ============
    constructor() Ownable(msg.sender) {}

    // ============ External Functions ============

    function createCampaign(
        string calldata _title,
        string calldata _description,
        string[] calldata _milestoneDescriptions,
        uint256[] calldata _milestoneAmounts,
        uint256[] calldata _milestoneDeadlines
    ) external returns (uint256) {
        require(_milestoneDescriptions.length == _milestoneAmounts.length, "Mismatched arrays");
        require(_milestoneDescriptions.length > 0, "Need at least one milestone");
        require(_milestoneDescriptions.length == _milestoneDeadlines.length, "Mismatched deadline array");

        uint256 cId = campaignCount;
        campaignCount++;

        CampaignInfo storage c = campaigns[cId];
        c.campaignId = cId;
        c.ngoAddress = payable(msg.sender);
        c.title = _title;
        c.description = _description;
        c.milestoneCount = _milestoneDescriptions.length;
        c.isActive = true;

        uint256 total = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            require(_milestoneAmounts[i] > 0, "Milestone amount must be > 0");
            total += _milestoneAmounts[i];
            
            Milestone storage m = milestones[cId][i];
            m.description = _milestoneDescriptions[i];
            m.fundAmount = _milestoneAmounts[i];
            m.deadline = _milestoneDeadlines[i];
        }
        c.totalFunds = total;

        emit CampaignCreated(cId, msg.sender, total);
        return cId;
    }

    function donate(uint256 _campaignId) 
        external 
        payable 
        campaignExists(_campaignId) 
        campaignActive(_campaignId) 
        nonReentrant 
    {
        require(msg.value > 0, "Donation must be > 0");

        CampaignInfo storage campaign = campaigns[_campaignId];
        
        if (donations[_campaignId][msg.sender] == 0) {
            campaignDonors[_campaignId].push(msg.sender);
        }
        
        donations[_campaignId][msg.sender] += msg.value;
        campaign.raisedFunds += msg.value;
        totalDonated += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    function submitMilestoneProof(
        uint256 _campaignId, 
        uint256 _milestoneIndex, 
        string calldata _ipfsHash
    ) 
        external 
        campaignExists(_campaignId) 
        onlyNGO(_campaignId) 
        campaignActive(_campaignId) 
    {
        require(_milestoneIndex < campaigns[_campaignId].milestoneCount, "Invalid milestone");
        Milestone storage milestone = milestones[_campaignId][_milestoneIndex];
        require(!milestone.isApproved, "Already approved");
        require(!milestone.isRejected, "Milestone rejected");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        milestone.ipfsHash = _ipfsHash;

        emit ProofSubmitted(_campaignId, _milestoneIndex, _ipfsHash);
    }

    function approveMilestone(uint256 _campaignId, uint256 _milestoneIndex) 
        external 
        campaignExists(_campaignId) 
        onlyValidator() 
        campaignActive(_campaignId) 
    {
        require(_milestoneIndex < campaigns[_campaignId].milestoneCount, "Invalid milestone");
        Milestone storage milestone = milestones[_campaignId][_milestoneIndex];
        require(bytes(milestone.ipfsHash).length > 0, "No proof submitted");
        require(!milestone.isApproved, "Already approved");
        require(!hasVoted[_campaignId][_milestoneIndex][msg.sender], "Already voted");

        hasVoted[_campaignId][_milestoneIndex][msg.sender] = true;
        milestone.approvalCount++;

        if (milestone.approvalCount >= APPROVAL_THRESHOLD) {
            milestone.isApproved = true;
            totalMilestonesCompleted++;
            emit MilestoneApproved(_campaignId, _milestoneIndex);
            _releaseFunds(_campaignId, _milestoneIndex);
        }
    }

    function refundDonors(uint256 _campaignId) 
        external 
        campaignExists(_campaignId) 
        nonReentrant 
    {
        CampaignInfo storage campaign = campaigns[_campaignId];
        require(campaign.isFrozen, "Campaign must be frozen for refund");
        require(campaign.isActive, "Campaign already closed");
        
        campaign.isActive = false;
        
        uint256 totalRefunded = 0;
        address[] memory donors = campaignDonors[_campaignId];
        
        for (uint256 i = 0; i < donors.length; i++) {
            uint256 amount = donations[_campaignId][donors[i]];
            if (amount > 0) {
                donations[_campaignId][donors[i]] = 0;
                (bool sent, ) = payable(donors[i]).call{value: amount}("");
                if (sent) {
                    totalRefunded += amount;
                }
            }
        }

        emit DonorsRefunded(_campaignId, totalRefunded);
    }

    function registerValidator() external payable nonReentrant {
        require(!validators[msg.sender], "Already a validator");
        require(msg.value >= VALIDATOR_STAKE, "Must stake at least 0.01 ETH");

        validators[msg.sender] = true;
        validatorStakes[msg.sender] = msg.value;
        validatorCount++;

        emit ValidatorRegistered(msg.sender);
    }

    function freezeCampaign(uint256 _campaignId) 
        external 
        onlyOwner 
        campaignExists(_campaignId) 
    {
        campaigns[_campaignId].isFrozen = true;
        emit CampaignFrozen(_campaignId);
    }

    // ============ Internal Functions ============

    function _releaseFunds(uint256 _campaignId, uint256 _milestoneIndex) internal {
        Milestone storage milestone = milestones[_campaignId][_milestoneIndex];
        CampaignInfo storage campaign = campaigns[_campaignId];
        
        require(!milestone.fundsReleased, "Funds already released");
        
        uint256 amount = milestone.fundAmount;
        
        if (address(this).balance >= amount) {
            milestone.fundsReleased = true;
            (bool sent, ) = campaign.ngoAddress.call{value: amount}("");
            require(sent, "Transfer failed");
            
            emit FundsReleased(_campaignId, _milestoneIndex, amount);
        }
    }

    // ============ View Functions ============
    // Split getCampaign into two functions to avoid stack-too-deep

    function getCampaignBasic(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (
            uint256 campaignId,
            address ngoAddress,
            string memory title,
            string memory description
        ) 
    {
        CampaignInfo storage c = campaigns[_campaignId];
        return (c.campaignId, c.ngoAddress, c.title, c.description);
    }

    function getCampaignFunds(uint256 _campaignId)
        external
        view
        campaignExists(_campaignId)
        returns (
            uint256 totalFunds,
            uint256 raisedFunds,
            uint256 milestoneCount,
            bool isActive,
            bool isFrozen
        )
    {
        CampaignInfo storage c = campaigns[_campaignId];
        return (c.totalFunds, c.raisedFunds, c.milestoneCount, c.isActive, c.isFrozen);
    }

    function getMilestone(uint256 _campaignId, uint256 _milestoneIndex) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (
            string memory description,
            uint256 fundAmount,
            string memory ipfsHash,
            uint8 approvalCount,
            bool isApproved,
            bool isRejected,
            uint256 deadline,
            bool fundsReleased
        ) 
    {
        require(_milestoneIndex < campaigns[_campaignId].milestoneCount, "Invalid milestone");
        Milestone storage m = milestones[_campaignId][_milestoneIndex];
        return (
            m.description,
            m.fundAmount,
            m.ipfsHash,
            m.approvalCount,
            m.isApproved,
            m.isRejected,
            m.deadline,
            m.fundsReleased
        );
    }

    function getCampaignCount() external view returns (uint256) {
        return campaignCount;
    }

    function getDonation(uint256 _campaignId, address _donor) 
        external 
        view 
        returns (uint256) 
    {
        return donations[_campaignId][_donor];
    }

    function getDonors(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (address[] memory) 
    {
        return campaignDonors[_campaignId];
    }

    function isValidator(address _addr) external view returns (bool) {
        return validators[_addr];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
