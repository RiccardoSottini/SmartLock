pragma solidity ^0.8.18;

contract SmartDoor {
    /* Enumeration with the roles of the user */
    enum Role { NULL, OWNER, GUEST }

    /* Enumeration with the statuses of the authorisation */
    enum Status { NULL, PENDING, ACCEPTED, REJECTED }

    /* Structure to store an authorisation */
    struct Authorisation {
        uint timestamp;     // timestamp of the request
        address guest;      // address of the guest 
        Status status;      // status of the authorisation
        bool exists;        // flag to prove the authorisation existance
    }

    /* Structure to store a door access */
    struct Access {
        uint timestamp;     // timestamp of the request
        address guest;      // address of the guest
    }

    address payable owner;  
    address[] guests;       

    mapping(address => Authorisation) authorisations;
    mapping(address => Access[]) accesses;

    constructor() {
        owner = payable(msg.sender);
    }

    event pendingAuthorisation(address guest);
    event acceptedAuthorisation(address guest);
    event rejectedAuthorisation(address guest);

    event newAccess(address guest);
    event newReset();

    /* Function to retrieve the role of the user */
    function getRole() public view returns (Role) {
        if(msg.sender == owner) {
            return Role.OWNER;
        }

        return Role.GUEST;
    }

    /* Function to request the authorisation - Guest functionality */
    function requestAuthorisation() public payable {
        // Check if the guest has already requested an authorisation
        require(authorisations[msg.sender].exists == false, "You have already requested an authorisation");

        // Register the authorisation request with the pending status
        authorisations[msg.sender] = Authorisation(block.timestamp, msg.sender, Status.PENDING, true);
        guests.push(msg.sender);

        // Emit the event highlighting a new pending authorisation
        emit pendingAuthorisation(msg.sender);
    }

    /* Function to retrieve the authorisation - Guest functionality */
    function getAuthorisation() public view returns (Authorisation memory) {
        if(authorisations[msg.sender].exists && authorisations[msg.sender].status != Status.NULL) {
            return authorisations[msg.sender];
        }

        return Authorisation(0, address(0x0), Status.NULL, false);
    }

    /* Function to access the door - Guest functionality */
    function accessDoor() public payable {
        // Check if the guest has an accepted authorisation
        require(authorisations[msg.sender].exists && authorisations[msg.sender].status == Status.ACCEPTED, "You do not have an accepted authorisation to access the door");

        // Register the successful access to the door
        accesses[msg.sender].push(Access(block.timestamp, msg.sender));

        // Emit an event highlighting a new access to the door
        emit newAccess(msg.sender);
    }

    /* Function to retrieve the list of door accesses of the guest - Guest functionality */
    function getAccesses() public view returns (Access[] memory) {
        uint count = accesses[msg.sender].length;
        Access[] memory localAccesses = new Access[](count);

        for (uint index = 0; index < count; index++) {
            localAccesses[index] = accesses[msg.sender][index];
        }
        
        return localAccesses;
    }

    /* Function to get all the data - Owner functionality */
    function getData() public view returns (Authorisation[] memory) {
        require(msg.sender == owner, "You need to be the owner of the contract");

        uint count = guests.length;
        Authorisation[] memory localAuthorisations = new Authorisation[](count);

        for (uint index = 0; index < count; index++) {
            localAuthorisations[index] = authorisations[guests[index]];
        }

        return localAuthorisations;
    }

    /* Function to accept an authorisation request - Owner functionality */
    function acceptAuthorisation(address guest) public payable {
        require(msg.sender == owner, "You need to be the owner of the contract");
        require(authorisations[guest].exists, "The authorisation request does not exist");
        require(authorisations[guest].exists && authorisations[guest].status != Status.ACCEPTED, "The authorisation request has already been accepted");

        authorisations[guest].status = Status.ACCEPTED;

        emit acceptedAuthorisation(guest);
    }
    
    /* Function to reject an authorisation request - Owner functionality */
    function rejectAuthorisation(address guest) public payable {
        require(msg.sender == owner, "You need to be the owner of the contract");
        require(authorisations[guest].exists, "The authorisation request does not exist");
        require(authorisations[guest].exists && authorisations[guest].status != Status.REJECTED, "The authorisation request has already been rejected");

        authorisations[guest].status = Status.REJECTED;

        emit rejectedAuthorisation(guest);
    }

    /* Function to delete an authorisation request - Owner functionality */
    /*function deleteAuthorisation(address guest) public payable {
        require(msg.sender == owner, "You need to be the owner of the contract");
        require(authorisations[guest].exists, "The authorisation request does not exist");

        delete authorisations[guest];
        delete accesses[guest];
        removeGuest(guest);

        emit deletedAuthorisation(guest);
    }*/

    /* Function to reset the data stored in the contract - Owner functionality */
    function reset() public payable {
        require(msg.sender == owner, "You need to be the owner of the contract");

        for(uint index = 0; index < guests.length; index++) {
            delete authorisations[guests[index]];
            delete accesses[guests[index]];
        }

        delete guests;

        emit newReset();
    }

    /*function sendTicket(address recipient) public payable {
        require(msg.sender == owner, "You need to be the owner of the contract");
        require(tickets[recipient].exists == false, "The address already has a ticket");

        (bool success,) = owner.call{value: msg.value}("");
        require(success, "Failed to buy the ticket");

        tickets[recipient] = Ticket(block.timestamp, recipient, true);
        users.push(recipient);

        emit newTicket(recipient);
    }*/

    /*function removeGuest(address guest) private {
        for (uint index = 0; index < guests.length; index++) {
            if (guests[index] == guest) {
                for (uint j = index; j < guests.length - 1; j++) {
                    guests[j] = guests[j + 1];
                }

                guests.pop();
                return;
            }
        }
    }*/
}