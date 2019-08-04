pragma solidity >=0.4.21 <0.6.0;

import './SebToken.sol';

contract SebTokenSale {
    address admin;
    SebToken public tokenContract;
    uint256 public tokenPrice;

    constructor(SebToken _tokenContract, uint256 _tokenPrice) public {
        // Assign Admin
        admin = msg.sender;

        // Add Token Contract
        tokenContract = _tokenContract;

        // Token Price
        tokenPrice = _tokenPrice;
    }
}