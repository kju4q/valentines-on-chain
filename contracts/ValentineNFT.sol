// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ValentineNFT is ERC721 {
    struct RelationshipMilestone {
        uint256 timestamp;
        string milestone;
        uint256 giftValue;
        string aiGeneratedArt;
    }

    mapping(uint256 => RelationshipMilestone[]) public tokenMilestones;
    mapping(address => bool) public hasReceivedFirstGiftNFT;
    mapping(address => uint256) public giftsSent;

    function addMilestone(
        uint256 tokenId,
        string memory milestone,
        string memory newArtwork
    ) external payable {
        RelationshipMilestone memory newMilestone = RelationshipMilestone({
            timestamp: block.timestamp,
            milestone: milestone,
            giftValue: msg.value,
            aiGeneratedArt: newArtwork
        });

        tokenMilestones[tokenId].push(newMilestone);
        giftsSent[msg.sender] += 1;
        emit MilestoneAdded(tokenId, msg.sender, msg.value, milestone);
        
        // Only mint NFT for first-time gifters
        if (!hasReceivedFirstGiftNFT[msg.sender]) {
            hasReceivedFirstGiftNFT[msg.sender] = true;
            _mint(msg.sender, totalSupply() + 1);
        }
        
        _updateTokenURI(tokenId);
    }

    function getGiftCount(address user) public view returns (uint256) {
        return giftsSent[user];
    }
} 