// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

// Define custom interface for external ERC1155 contract (with mint function)
interface IExternalERC1155 is IERC1155 {
  function mint(address to, uint256 id, uint256 amount, bytes memory data) external;
}

contract DailyStreakSystem is Ownable {
  IExternalERC1155 public externalERC1155;
  mapping(address => uint256) public streak;
  mapping(address => uint256) public lastClaimed;
  mapping(uint256 => uint256) public milestoneToTokenId;

  // Array to store all of the defined milestones
  uint256[] private _milestones;

  event Claimed(address indexed user, uint256 streak);

  constructor(address initialOwner, address _externalERC1155Address) Ownable(initialOwner) {
    externalERC1155 = IExternalERC1155(_externalERC1155Address);
  }

  function setExternalERC1155(address _externalERC1155Address) public onlyOwner {
    externalERC1155 = IExternalERC1155(_externalERC1155Address);
  }

  function claim() public {
    //Is this the first time the user is claiming or they have missed a day? If so set streak to 1
    if (lastClaimed[msg.sender] == 0 || block.timestamp - lastClaimed[msg.sender] > 2 days) {
      streak[msg.sender] = 1;
    } else {
      require(block.timestamp - lastClaimed[msg.sender] >= 1 days, "You can only claim once per day");
      streak[msg.sender]++;
    }
    lastClaimed[msg.sender] = block.timestamp;
    // Check if the user has reached any milestones
    if (milestoneToTokenId[streak[msg.sender]] != 0) {
      // Mint the milestone token to the user
      externalERC1155.mint(msg.sender, milestoneToTokenId[streak[msg.sender]], 1, "");
    }
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

  function setMilestone(uint256 milestone, uint256 tokenId) public onlyOwner {
    // Check if milestone has already been added
    for (uint256 i = 0; i < _milestones.length; i++) {
      if (_milestones[i] == milestone) {
        revert("Milestone already exists");
      }
    }
    milestoneToTokenId[milestone] = tokenId;
    //milestoneToPointReward[milestone] = pointReward;
    _milestones.push(milestone);
  }
}
