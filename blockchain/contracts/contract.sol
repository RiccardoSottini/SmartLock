// Solidity version adopted by the contract
pragma solidity ^0.8.18;

// Definition of the Contract interface
contract SmartDoor {
    /* Enumeration with the roles of the user */
    enum Role { NULL, OWNER, GUEST }

    /* Enumeration with the statuses of the authorisation */
    enum Status { NULL, PENDING, ACCEPTED, REJECTED }

    /* Structure to store an authorisation */
    struct Authorisation {
        uint timestamp;     // timestamp of the request
        address guest;      // address of the guest 
        string name;        // name of the guest
        Status status;      // status of the authorisation
        bool exists;        // flag to prove the authorisation existance
    }

    /* Structure to store a door access */
    struct Access {
        uint timestamp;     // timestamp of the request
        address guest;      // address of the guest
    }

    address payable immutable owner;  // address of the contract owner
    address[] guests;       // list of guests

    mapping(address => Authorisation) authorisations;   // map between guest address and its authorisation request
    mapping(address => Access[]) accesses;              // map between guest address and its door accesses

    /* Constructor - it saves the owner address */
    constructor() {
        // Save the owner address
        owner = payable(msg.sender);
    }

    /* Definition of the events */
    event newAccess();                                  // event emitted when there is a new door access
    event newReset();                                   // event emitted when the contract is reset
    event updateGuest(address guest, string method);    // event emitted when data is altered and the guest has to request updated data
    event updateOwner(string method);                   // event emitted when data is altered and the owner has to request updated data

    /* Function to retrieve the role of the user */
    function getRole() public view returns (Role) {
        // Check if the address is equal to the owner address, if so return the Role "OWNER"
        if(msg.sender == owner) {
            return Role.OWNER;
        }

        // Return the Role "GUEST"
        return Role.GUEST;
    }

    /* Function to request the authorisation - Guest functionality */
    function requestAuthorisation(string memory name) public {
        // Check if the guest has already requested an authorisation, otherwise interrupt the function execution with an error message
        require(!authorisations[msg.sender].exists, "You have already requested an authorisation");

        // Register the authorisation request with the pending status
        authorisations[msg.sender] = Authorisation(block.timestamp, msg.sender, name, Status.PENDING, true);
        guests.push(msg.sender);

        // Emit the events to notify guests and owners about a new pending authorisation
        emit updateGuest(msg.sender, "pendingAuthorisation");
        emit updateOwner("pendingAuthorisation");
    }

    /* Function to retrieve the authorisation - Guest functionality */
    function getAuthorisation() public view returns (Authorisation memory) {
        // Check if the authorisation exists and it is not null, in that case return the guest's authorisation
        if(authorisations[msg.sender].exists && uint(authorisations[msg.sender].status) != uint(Status.NULL)) {
            return authorisations[msg.sender];
        }

        // Return a null authorisation
        return Authorisation(0, address(0x0), "", Status.NULL, false);
    }

    /* Function to access the door - Guest functionality */
    function accessDoor() public {
        // Check if the guest has an accepted authorisation, otherwise interrupt the function execution with an error message
        require(authorisations[msg.sender].exists && uint(authorisations[msg.sender].status) == uint(Status.ACCEPTED), "You do not have an accepted authorisation to access the door");
        
        // Register the successful access to the door
        accesses[msg.sender].push(Access(block.timestamp, msg.sender));

        // Emit an event highlighting a new access to the door
        emit newAccess();

        // Emit the events to notify guests and owners about a new door access
        emit updateGuest(msg.sender, "newAccess");
        emit updateOwner("newAccess");
    }

    /* Function to retrieve the list of door accesses of the guest - Guest functionality */
    function getAccesses() public view returns (Access[] memory) {
        // Setup an array used as a local copy of the door accesses
        uint count = accesses[msg.sender].length;
        Access[] memory localAccesses = new Access[](count);

        // Loop through the stored door accessess and copy each in the local array
        for (uint index = 0; index < count; index++) {
            localAccesses[index] = accesses[msg.sender][index];
        }
        
        // Return the local copy of door accesses
        return localAccesses;
    }

    /* Function to get all the data - Owner functionality */
    function getData() public view returns (Authorisation[] memory) {
        // Check if the user is the owner, otherwise interrupt the function execution with an error message
        require(msg.sender == owner, "You need to be the owner of the contract");

        // Setup an array used as a local copy of the authorisations
        uint count = guests.length;
        Authorisation[] memory localAuthorisations = new Authorisation[](count);

        // Loop through the stored authorisations and copy each in the local array
        for (uint index = 0; index < count; index++) {
            localAuthorisations[index] = authorisations[guests[index]];
        }

        // Return the local copy of authorisations
        return localAuthorisations;
    }

    /* Function to create an authorisation request - Owner functionality */
    function createAuthorisation(string memory name, address guest) public {
        // Check if the user is the owner and the authorisation does not exist, otherwise interrupt the function execution with an error message
        require(msg.sender == owner, "You need to be the owner of the contract");
        require(!authorisations[guest].exists, "The authorisation request already exists");

        // Register the authorisation request with the accepted status
        authorisations[guest] = Authorisation(block.timestamp, guest, name, Status.ACCEPTED, true);
        guests.push(guest);

        // Emit the events to notify guests and owners that the authorisation has been accepted
        emit updateGuest(guest, "acceptedAuthorisation");
        emit updateOwner("acceptedAuthorisation");
    }

    /* Function to accept an authorisation request - Owner functionality */
    function acceptAuthorisation(address guest) public {
        // Check if the user is the owner, and the authorisation does not exist and is not accepted, otherwise interrupt the function execution with an error message
        require(msg.sender == owner, "You need to be the owner of the contract");
        require(authorisations[guest].exists, "The authorisation request does not exist");
        require(authorisations[guest].exists && uint(authorisations[guest].status) != uint(Status.ACCEPTED), "The authorisation request has already been accepted");

        // Change the authorisation status to ACCEPTED
        authorisations[guest].status = Status.ACCEPTED;

        // Emit the events to notify guests and owners that the authorisation has been accepted
        emit updateGuest(guest, "acceptedAuthorisation");
        emit updateOwner("acceptedAuthorisation");
    }
    
    /* Function to reject an authorisation request - Owner functionality */
    function rejectAuthorisation(address guest) public {
        // Check if the user is the owner, and the authorisation does not exist and is not rejected, otherwise interrupt the function execution with an error message
        require(msg.sender == owner, "You need to be the owner of the contract");
        require(authorisations[guest].exists, "The authorisation request does not exist");
        require(authorisations[guest].exists && uint(authorisations[guest].status) != uint(Status.REJECTED), "The authorisation request has already been rejected");

        // Change the authorisation status to REJECTED
        authorisations[guest].status = Status.REJECTED;

        // Emit the events to notify guests and owners that the authorisation has been rejected
        emit updateGuest(guest, "rejectedAuthorisation");
        emit updateOwner("rejectedAuthorisation");
    }

    /* Function to retrieve the list of door accesses of a specific guest - Owner functionality */
    function getAccesses(address guest) public view returns (Access[] memory) {
        // Check if the user is the owner and the authorisation does not exist, otherwise interrupt the function execution with an error message
        require(msg.sender == owner, "You need to be the owner of the contract");
        require(authorisations[guest].exists, "The authorisation request does not exist");

        // Setup an array used as a local copy of the door accesses
        uint count = accesses[guest].length;
        Access[] memory localAccesses = new Access[](count);

        // Loop through the stored door accessess and copy each in the local array
        for (uint index = 0; index < count; index++) {
            localAccesses[index] = accesses[guest][index];
        }
        
        // Return the local copy of door accesses
        return localAccesses;
    }

    /* Function to reset the data stored in the contract - Owner functionality */
    function reset() public {
        // Check if the user is the owner, otherwise interrupt the function execution with an error message
        require(msg.sender == owner, "You need to be the owner of the contract");

        // Loop through the stored guests list and delete the associated authorisations and door accesses for each guest
        uint256 count = guests.length;
        for(uint index = 0; index < count; index++) {
            delete authorisations[guests[index]];
            delete accesses[guests[index]];
        }

        // Delete the list of guests
        delete guests;

        // Emit the events to notify the users that the contract has been reset
        emit newReset();

        // Emit the events to notify the owner that the contract has been reset
        emit updateOwner("newReset");
    }
}