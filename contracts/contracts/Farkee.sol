// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface ERC20 {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract Farkee {
    event BuySpace(
        address buyer,
        uint amount,
        bytes32 textHash,
        uint fid,
        uint8 spaceType,
        uint nonce
    );

    event RegisterSpace(
        address owner,
        uint fid,
        uint[] prices,
        uint8[] spaceTypes
    );
    struct Space {
        address owner;
        uint256[] prices;
        uint8[] spaceTypes;
    }

    mapping(uint => Space) public spaceOwners;

    address public admin;
    address public paymentToken;
    uint[] public spaces;
    uint nonce;

    constructor(address _paymentToken) {
        paymentToken = _paymentToken;
        admin = msg.sender;
    }

    function onTokenTransfer(
        address sender,
        uint amount,
        bytes calldata data
    ) external {
        bytes32 textHash;
        uint fid;
        uint8 spaceType;
        require(msg.sender == paymentToken, "Unauthorized token contract");
        Space memory space = spaceOwners[fid];
        require(space.owner != address(0), "Space not registered");
        require(amount >= space.prices[spaceType], "Insufficient payment");
        (textHash, fid, spaceType) = abi.decode(data, (bytes32, uint, uint8));
        ERC20(paymentToken).transferFrom(address(this), space.owner, amount);
        emit BuySpace(sender, amount, textHash, fid, spaceType, nonce++);
    }

    function registerSpace(
        uint fid,
        address owner,
        uint[] calldata prices,
        uint8[] calldata spaceTypes
    ) external {
        require(msg.sender == admin, "Only admin can register spaces");
        spaceOwners[fid] = Space(owner, prices, spaceTypes);
        spaces.push(fid);
        emit RegisterSpace(owner, fid, prices, spaceTypes);
    }

    function getSpaces() external view returns (Space[] memory allSpaces) {
        allSpaces = new Space[](spaces.length);
        for (uint i = 0; i < spaces.length; i++) {
            allSpaces[i] = spaceOwners[spaces[i]];
        }
    }
}
