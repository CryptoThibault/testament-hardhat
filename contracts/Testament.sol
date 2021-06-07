// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract Testament {
  mapping(address => uint) private _balances;
  address _owner;
  address _doctor;
  bool _died;

  event Donation(address indexed receiver, uint amount);
  event SetDoctor(address lastDoctor, address newDoctor);
  event SetDied(address owner, uint timestamp);
  event Withdrew(address indexed sender, uint amount);

  constructor(address doctor_) {
    _owner = msg.sender;
    _doctor = doctor_;
    emit SetDoctor(address(0), doctor_);
  }
  
  modifier ownerOnly {
    require (msg.sender == _owner, "Testament: reserved to testament owner");
    _;
  }

  function donate(address to) public payable ownerOnly returns (bool) {
    require (to != msg.sender, "Testament: cannot donate to yourself");
    _balances[to] += msg.value;
    emit Donation(to, msg.value);
    return true;
  }
  function setDoctor(address doctor_) public ownerOnly returns (bool) {
    require(doctor_ != _owner, "Testament: cannot set yourself as doctor");
    emit SetDoctor(_doctor, doctor_);
    _doctor = doctor_;
    return true;
  }

  function setDied() public returns (bool) {
    require(msg.sender == _doctor, "Testament: reserved to testament doctor");
    _died = true;
    emit SetDied(_owner, block.timestamp);
    return true;
  }

  function withdraw() public returns (bool) {
    require(_died, "Testament: testament owner actually alive");
    uint amount = _balances[msg.sender];
    _balances[msg.sender] = 0;
    payable(msg.sender).transfer(amount);
    emit Withdrew(msg.sender, amount);
    return true;
  }

  function balance() public view returns (uint) {
    return _balances[msg.sender];
  }
  function owner() public view returns (address) {
    return _owner;
  }
  function doctor() public view ownerOnly returns (address) {
    return _doctor;
  }
  function died() public view returns (bool) {
    return _died;
  }

}