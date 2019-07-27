pragma solidity >=0.4.21 <0.6.0;

contract SebToken {
    uint256 public totalSupply;

    constructor(uint256 _initialSupply) public {
        totalSupply = _initialSupply;
    }
}