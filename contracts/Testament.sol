// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract Testament {
  mapping(address => uint) private _balances;
  address _owner;
  address _doctor;
  bool _died;

  constructor(address doctor_) {
    _owner = msg.sender;
    _doctor = doctor_;
  }

  function donate(address to) public payable returns (bool) {
    require(msg.sender == _owner, "Testament: reserved to testament owner");
    _balances[to] += msg.value;
    return true;
  }

  function setDied() public returns (bool) {
    require(msg.sender == _doctor, "Testament: reserved to testament doctor")
  }

  function withdraw() public returns (bool) {
    require(_died, "Testament: testament owner actually alive");
    uint amount = _balances[msg.sender];
    _balances[msg.sender] = 0;
    payable(msg.sender).transfer(amount);
    return true;
  }

  function owner() public view returns (address) {
    return _owner;
  }
  function died() public view returns (bool) {
    return _died;
  }

}