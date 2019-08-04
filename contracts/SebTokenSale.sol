pragma solidity >=0.4.21 <0.6.0;

import './SebToken.sol';

contract SebTokenSale {
    address admin;
    SebToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    constructor(SebToken _tokenContract, uint256 _tokenPrice) public {
        // Assign Admin
        admin = msg.sender;

        // Add Token Contract
        tokenContract = _tokenContract;

        // Token Price
        tokenPrice = _tokenPrice;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        // Require value = tokens
        // Require contract has enough tokens
        // Require that transfer is successful

        // Track tokensSold
        tokensSold += _numberOfTokens;

        // Sell Event
    }
}