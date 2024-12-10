// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import {ERC1155Pausable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract RoguesItems is ERC1155, Ownable, ERC1155Pausable, ERC1155Burnable {
  using Strings for uint256;

  constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

  function balanceOfBatchOneAddr(address account, uint256[] memory ids) public view returns (uint256[] memory) {
    uint256[] memory batchBalances = new uint256[](ids.length);
    for (uint256 i = 0; i < ids.length; ++i) {
      batchBalances[i] = balanceOf(account, ids[i]);
    }
    return batchBalances;
  }

  function setURI(string memory newuri) public onlyOwner {
    _setURI(newuri);
  }

  function uri(uint256 tokenId) public view override returns (string memory) {
    string memory baseURI = ERC1155.uri(tokenId);
    return string(abi.encodePacked(baseURI, tokenId.toString()));
  }

  function pause() public onlyOwner {
    _pause();
  }

  function unpause() public onlyOwner {
    _unpause();
  }

  function mint(address account, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
    _mint(account, id, amount, data);
  }

  function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
    _mintBatch(to, ids, amounts, data);
  }

  function mintBatchAddr(address[] memory accounts, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
    for (uint256 i = 0; i < accounts.length; ++i) {
      _mint(accounts[i], ids[i], amounts[i], data);
    }
  }

  // The following functions are overrides required by Solidity.

  function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal override(ERC1155, ERC1155Pausable) {
    super._update(from, to, ids, values);
  }
}
