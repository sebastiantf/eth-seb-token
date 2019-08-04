pragma solidity >=0.4.21 <0.6.0;

contract SebToken {
    string public name = 'Seb Token';   // optional
    string public symbol = 'SEB';       // optional
    uint256 public totalSupply;         // required

    mapping(address => uint256) public balanceOf; // required

    event Transfer(     // required
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {     // required
        require(balanceOf[msg.sender] >= _value, '');

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);     // required

        return true;    // required
    }
}