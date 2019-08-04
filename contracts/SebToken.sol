pragma solidity >=0.4.21 <0.6.0;

contract SebToken {
    string public name = 'Seb Token';   // optional
    string public symbol = 'SEB';       // optional
    uint256 public totalSupply;         // required

    mapping(address => uint256) public balanceOf; // required
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(     // required
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(     // required
        address indexed _owner,
        address indexed _spender,
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

    function approve(address _spender, uint256 _value) public returns (bool success) {  // required
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // Require _from has enough balance
        require(balanceOf[_from] >= _value, '');

        // Require _value within allowance
        require(allowance[_from][msg.sender] >= _value, '');

        // Update balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // Update allowance
        allowance[_from][msg.sender] -= _value;

        // Transfer event
        emit Transfer(_from, _to, _value);

        // return true
        return true;
    }
}