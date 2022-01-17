pragma solidity ^0.8.0;

contract Inbox {
    string public message;

    function myInbox(string memory inititialMessage) public {
        message = inititialMessage;
    }

    function setMessage(string memory newMessage) public {
        message = newMessage;
    }
}