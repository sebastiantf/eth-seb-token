pragma solidity >=0.4.21 <0.6.0;

import './SebToken.sol';

contract SebTokenSale {
    address admin;
    SebToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(
        address _buyer,
        uint256 _numberOfTokens
    );

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }

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
        require(msg.value == multiply(_numberOfTokens, tokenPrice), '');
        
        // Require contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens, '');
        
        // Require that transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens), '');

        // Track tokensSold
        tokensSold += _numberOfTokens;

        // Sell Event
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        // Require admin to endSale
        require(msg.sender == admin, '');
        
        // Return remaining tokens to admin
        // Destroy contract
    }
}