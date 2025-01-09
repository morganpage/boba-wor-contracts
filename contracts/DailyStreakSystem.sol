// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DailyStreakSystem is Ownable {
  mapping(address => uint256) public streak;
  mapping(address => uint256) public lastClaimed;
  event Claimed(address indexed user, uint256 streak);

  constructor(address initialOwner) Ownable(initialOwner) {}

  function claim() public {
    //Is this the first time the user is claiming or they have missed a day? If so set streak to 1
    if (lastClaimed[msg.sender] == 0 || block.timestamp - lastClaimed[msg.sender] > 2 days) {
      streak[msg.sender] = 1;
    } else {
      require(block.timestamp - lastClaimed[msg.sender] >= 1 days, "You can only claim once per day");
      streak[msg.sender]++;
    }
    lastClaimed[msg.sender] = block.timestamp;
    // Emit an event to notify the user has claimed
    emit Claimed(msg.sender, streak[msg.sender]);
  }

  function getBlockTimestamp() public view returns (uint256) {
    return block.timestamp;
  }

  function getStreak(address user) public view returns (uint256) {
    return streak[user];
  }

  function getLastClaimed(address user) public view returns (uint256) {
    return lastClaimed[user];
  }

  function setStreak(address user, uint256 _streak) public onlyOwner {
    streak[user] = _streak;
  }

  //Used for testing
  function claimHoursAgo(address user, uint256 hoursAgo) public onlyOwner {
    lastClaimed[user] = block.timestamp - hoursAgo * 1 hours;
  }

  //Get how long before the user can claim again
  function timeUntilCanClaim(address user) public view returns (uint256) {
    if (lastClaimed[user] == 0) {
      return 0;
    }
    if (block.timestamp - lastClaimed[user] >= 1 days) {
      return 0;
    }
    return 1 days - (block.timestamp - lastClaimed[user]);
  }

  //Get how long before streak resets
  function timeUntilStreakReset(address user) public view returns (uint256) {
    if (lastClaimed[user] == 0) {
      return 0;
    }
    if (block.timestamp - lastClaimed[user] >= 2 days) {
      return 0;
    }
    return 2 days - (block.timestamp - lastClaimed[user]);
  }
}
