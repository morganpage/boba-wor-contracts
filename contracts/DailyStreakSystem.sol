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
  mapping(address => uint256) public points;
  mapping(uint256 => uint256) public milestoneToTokenId;
  mapping(uint256 => uint256) public milestoneToPointReward;

  // Array to store all of the defined token milestones
  uint256[] public token_Milestones;
  // Array to store all of the defined point milestones
  uint256[] public point_Milestones;

  event Claimed(address indexed user, uint256 streak, uint256 tokenId);

  constructor(address initialOwner, address _externalERC1155Address) Ownable(initialOwner) {
    externalERC1155 = IExternalERC1155(_externalERC1155Address);
  }

  function setExternalERC1155(address _externalERC1155Address) public onlyOwner {
    externalERC1155 = IExternalERC1155(_externalERC1155Address);
  }

  function claim() public {
    _claimFor(msg.sender);
  }

  function claimFor(address user) public onlyOwner {
    _claimFor(user);
  }

  function _claimFor(address user) private {
    //Is this the first time the user is claiming or they have missed a day? If so set streak to 1
    if (lastClaimed[user] == 0 || block.timestamp - lastClaimed[user] > 2 days) {
      streak[user] = 1;
    } else {
      require(block.timestamp - lastClaimed[user] >= 1 days, "You can only claim once per day");
      streak[user]++;
    }
    lastClaimed[user] = block.timestamp;
    // Emit an event to notify the user has claimed
    emit Claimed(user, streak[user], milestoneToTokenId[streak[user]]);

    // Check if the user has reached any token milestones, if so mint the token
    if (milestoneToTokenId[streak[user]] != 0) {
      // Mint the milestone token to the user
      externalERC1155.mint(user, milestoneToTokenId[streak[user]], 1, "");
    }
    // Check if the user has reached any point milestones, if so add the points
    if (milestoneToPointReward[streak[user]] != 0) {
      points[user] += milestoneToPointReward[streak[user]];
    }
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

  function setTokenMilestone(uint256 milestone, uint256 tokenId) public onlyOwner {
    // Check if milestone has already been added
    for (uint256 i = 0; i < token_Milestones.length; i++) {
      if (token_Milestones[i] == milestone) {
        revert("Milestone already exists");
      }
    }
    milestoneToTokenId[milestone] = tokenId;
    token_Milestones.push(milestone);
  }

  function setPointMilestone(uint256 milestone, uint256 pointReward) public onlyOwner {
    // Check if milestone has already been added
    for (uint256 i = 0; i < point_Milestones.length; i++) {
      if (point_Milestones[i] == milestone) {
        revert("Milestone already exists");
      }
    }
    milestoneToPointReward[milestone] = pointReward;
    point_Milestones.push(milestone);
  }

  //getter that returns all the token milestones and their corresponding token ids
  function getTokenMilestones() public view returns (uint256[] memory, uint256[] memory) {
    uint256[] memory tokenIds = new uint256[](token_Milestones.length);
    for (uint256 i = 0; i < token_Milestones.length; i++) {
      tokenIds[i] = milestoneToTokenId[token_Milestones[i]];
    }
    return (token_Milestones, tokenIds);
  }

  //getter that returns all the point milestones and their corresponding point rewards
  function getPointMilestones() public view returns (uint256[] memory, uint256[] memory) {
    uint256[] memory pointRewards = new uint256[](point_Milestones.length);
    for (uint256 i = 0; i < point_Milestones.length; i++) {
      pointRewards[i] = milestoneToPointReward[point_Milestones[i]];
    }
    return (point_Milestones, pointRewards);
  }
}
