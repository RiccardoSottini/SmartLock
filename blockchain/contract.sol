pragma solidity ^0.8.18;

contract SmartDoor {
    struct Ticket {
        uint timestamp;
        address user;
        bool exists;
    }

    struct Access {
        uint timestamp;
        address user;
    }

    address payable owner;
    address[] users;

    mapping(address => Ticket) tickets;
    mapping(address => Access[]) accesses;

    constructor() {
        owner = payable(msg.sender);
    }

    event newTicket(address user);
    event newAccess(address user);

    function buy() public payable {
        require(msg.value == 0.1 ether, "You must pay 0.1 ether for the ticket");
        require(tickets[msg.sender].exists == false, "You already have bought a ticket");

        (bool success,) = owner.call{value: msg.value}("");
        require(success, "Failed to buy the ticket");

        tickets[msg.sender] = Ticket(block.timestamp, msg.sender, true);
        users.push(msg.sender);

        emit newTicket(msg.sender);
    }

    function hasTicket() public view returns (bool) {
        return tickets[msg.sender].exists;
    }

    function access() public payable {
        require(tickets[msg.sender].exists, "You do not have a ticket");

        accesses[msg.sender].push(Access(block.timestamp, msg.sender));

        emit newAccess(msg.sender);
    }

    function getAccesses() public view returns (Access[] memory) {
        uint count = accesses[msg.sender].length;
        Access[] memory localAccesses = new Access[](count);

        for (uint index = 0; index < count; index++) {
            localAccesses[index] = accesses[msg.sender][index];
        }
        
        return localAccesses;
    }

    function reset() public payable {
        require(msg.sender == owner, "You need to be the owner of the contract");

        for(uint index = 0; index < users.length; index++) {
            tickets[users[index]] = Ticket(0, address(0x0), false);
            delete accesses[users[index]];
        }
    }
}