
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingPool is ReentrancyGuard, Ownable {
    struct UserDeposit {
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(address => mapping(address => UserDeposit)) public deposits; // user => token => deposit
    mapping(address => mapping(address => uint256)) public borrowings; // user => token => amount
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256) public totalDeposits;
    mapping(address => uint256) public interestRates;
    
    uint256 public constant COLLATERAL_RATIO = 150; // 150% collateral required
    
    event Deposit(address user, address token, uint256 amount);
    event Withdraw(address user, address token, uint256 amount);
    event Borrow(address user, address token, uint256 amount, address collateralToken, uint256 collateralAmount);
    event Repay(address user, address token, uint256 amount);
    
    constructor() {
        _transferOwnership(msg.sender);
    }
    
    function addSupportedToken(address token, uint256 interestRate) external onlyOwner {
        supportedTokens[token] = true;
        interestRates[token] = interestRate;
    }
    
    function deposit(address token, uint256 amount) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        deposits[msg.sender][token].amount += amount;
        deposits[msg.sender][token].timestamp = block.timestamp;
        totalDeposits[token] += amount;
        
        emit Deposit(msg.sender, token, amount);
    }
    
    function withdraw(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(deposits[msg.sender][token].amount >= amount, "Insufficient balance");
        
        deposits[msg.sender][token].amount -= amount;
        totalDeposits[token] -= amount;
        
        IERC20(token).transfer(msg.sender, amount);
        
        emit Withdraw(msg.sender, token, amount);
    }
    
    function borrow(address token, uint256 amount, address collateralToken) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(supportedTokens[collateralToken], "Collateral token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 collateralAmount = (amount * COLLATERAL_RATIO * getPrice(token)) / (100 * getPrice(collateralToken));
        
        IERC20(collateralToken).transferFrom(msg.sender, address(this), collateralAmount);
        IERC20(token).transfer(msg.sender, amount);
        
        borrowings[msg.sender][token] += amount;
        
        emit Borrow(msg.sender, token, amount, collateralToken, collateralAmount);
    }
    
    function repay(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(borrowings[msg.sender][token] >= amount, "Invalid repay amount");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        borrowings[msg.sender][token] -= amount;
        
        emit Repay(msg.sender, token, amount);
    }
    
    function getPrice(address token) internal pure returns (uint256) {
        // In production, this would fetch price from an oracle
        return 1000; // Placeholder price
    }
    
    function getUserDeposit(address user, address token) external view returns (uint256) {
        return deposits[user][token].amount;
    }
    
    function getUserBorrowing(address user, address token) external view returns (uint256) {
        return borrowings[user][token];
    }
}
