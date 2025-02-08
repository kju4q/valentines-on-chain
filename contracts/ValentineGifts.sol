// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ValentineGifts is Ownable {
    // USDC contract address
    IERC20 public usdcToken;
    
    // SheFi course price in USDC (700 USD with 6 decimals for USDC)
    uint256 public constant SHEFI_PRICE = 700 * 1e6;
    
    // SheFi treasury address
    address public shefiTreasury;
    
    // Events
    event CryptoGiftSent(address indexed from, address indexed to, uint256 amount, bool isEth);
    event SheFiGiftSent(address indexed from, address indexed to);

    constructor(address _usdcToken, address _shefiTreasury) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        shefiTreasury = _shefiTreasury;
    }

    // Send ETH gift
    function sendEthGift(address to) external payable {
        require(msg.value > 0, "Must send some ETH");
        require(to != address(0), "Invalid recipient");
        
        (bool success, ) = to.call{value: msg.value}("");
        require(success, "ETH transfer failed");
        
        emit CryptoGiftSent(msg.sender, to, msg.value, true);
    }

    // Send USDC gift
    function sendUsdcGift(address to, uint256 amount) external {
        require(amount > 0, "Must send some USDC");
        require(to != address(0), "Invalid recipient");
        
        require(usdcToken.transferFrom(msg.sender, to, amount), "USDC transfer failed");
        
        emit CryptoGiftSent(msg.sender, to, amount, false);
    }

    // Gift SheFi course
    function giftSheFiCourse(address to) external {
        require(to != address(0), "Invalid recipient");
        
        // Transfer USDC from sender to SheFi treasury
        require(
            usdcToken.transferFrom(msg.sender, shefiTreasury, SHEFI_PRICE),
            "USDC transfer failed"
        );
        
        emit SheFiGiftSent(msg.sender, to);
    }

    // Update SheFi treasury address
    function updateShefiTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        shefiTreasury = _newTreasury;
    }

    // Allow contract to receive ETH
    receive() external payable {}
} 