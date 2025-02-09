// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract ValentineAchievements is ERC1155 {
    struct Achievement {
        string name;
        string description;
        uint256 empowermentPoints;
        string imageURI;
    }

    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256) public empowermentScores;

    // Love-themed achievement names
    string[] public achievementNames = [
        "Crypto Cupid",
        "Chain Champion",
        "Web3 Wonderland",
        "DeFi Dreamer",
        "Blockchain Beauty"
    ];

    function mintAchievement(
        address recipient,
        uint256 achievementId
    ) external {
        _mint(recipient, achievementId, 1, "");
        empowermentScores[recipient] += achievements[achievementId].empowermentPoints;
        emit AchievementUnlocked(recipient, achievementId);
    }
} 