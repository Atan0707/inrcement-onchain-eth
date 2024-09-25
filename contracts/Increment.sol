// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Increment {
    uint public count;

    constructor(uint _count) {
        count = _count;
    }

    function increment() public {
        count += 1;
    }

    function getCount() public view returns (uint) {
        return count;
    }
}