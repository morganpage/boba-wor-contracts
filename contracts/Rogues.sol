// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Rogues is ERC721, ERC721Enumerable, ERC721Pausable, Ownable {
  using Math for uint256;
  uint256 private _lastTokenId;
  string public baseTokenURI;
  uint256 public max_supply;
  uint256 public price;
  address[] public whitelist;
  bool public minting;

  constructor(address initialOwner) ERC721("Rogues", "RGS") Ownable(initialOwner) {}

  function pause() public onlyOwner {
    _pause();
  }

  function unpause() public onlyOwner {
    _unpause();
  }

  function safeMint(address to) private {
    uint256 tokenId = ++_lastTokenId;
    _safeMint(to, tokenId);
  }

  // The following functions are overrides required by Solidity.

  function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable, ERC721Pausable) returns (address) {
    return super._update(to, tokenId, auth);
  }

  function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
    super._increaseBalance(account, value);
  }

  function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  // New non oz functions

  function _baseURI() internal view virtual override returns (string memory) {
    return baseTokenURI;
  }

  function setBaseURI(string memory _baseTokenURI) public onlyOwner {
    baseTokenURI = _baseTokenURI;
  }

  function mint(uint256 _count) public payable whenNotPaused {
    if (!minting) {
      require(isWhiteListed(msg.sender), "Only whitelisted addresses can mint");
    }
    require(_count > 0, "Must mint at least one token");
    require(_count <= 20, "Cannot mint more than 20 tokens at once");
    require(totalSupply() + _count <= max_supply, "Purchase would exceed max supply of tokens");
    (bool success, uint256 result) = price.tryMul(_count);
    require(success, "Multiplication overflow");
    require(msg.value >= result, "Ether value sent is not correct");

    for (uint256 i = 0; i < _count; i++) {
      safeMint(msg.sender);
    }
  }

  function tokensOfOwner(address _owner) external view returns (uint256[] memory) {
    uint256 tokenCount = balanceOf(_owner);
    uint256[] memory tokensId = new uint256[](tokenCount);

    for (uint256 i = 0; i < tokenCount; i++) {
      tokensId[i] = tokenOfOwnerByIndex(_owner, i);
    }
    return tokensId;
  }

  function withdraw() public payable onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "No ether");
    (bool success, ) = (msg.sender).call{value: balance}("");
    require(success, "Transfer failed.");
  }

  function setPrice(uint256 _price) public onlyOwner {
    price = _price;
  }

  function setMaxSupply(uint256 _max_supply) public onlyOwner {
    max_supply = _max_supply;
  }

  function mintForOwner(uint256 _mintAmount) public onlyOwner {
    for (uint256 i = 0; i < _mintAmount; i++) {
      safeMint(owner());
    }
  }

  // WL functions

  function setWhiteList(address[] calldata addresses) public onlyOwner {
    delete whitelist;
    whitelist = addresses;
  }

  function isWhiteListed(address _addr) public view returns (bool) {
    for (uint256 index = 0; index < whitelist.length; index++) {
      if (whitelist[index] == _addr) {
        return true;
      }
    }
    return false;
  }

  function setMinting(bool _state) public onlyOwner {
    minting = _state;
  }
}
