// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract State {
    bool private state;

    constructor () {
        state = false;
    }

    function turnOn () public returns (bool){
        state = true;
        return state;
    }

    function turnOff () public returns (bool){
        state = false;
        return state;
    }

    function getState () public view returns (bool){
        return state;
    }
}
