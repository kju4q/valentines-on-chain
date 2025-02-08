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

    function addMilestone(
        uint256 tokenId,
        string memory milestone,
        string memory newArtwork
    ) external {
        RelationshipMilestone memory newMilestone = RelationshipMilestone({
            timestamp: block.timestamp,
            milestone: milestone,
            giftValue: msg.value,
            aiGeneratedArt: newArtwork
        });

        tokenMilestones[tokenId].push(newMilestone);
        _updateTokenURI(tokenId); // Update NFT metadata
    }
} 