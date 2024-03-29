# Import Web3 - Time - RPi.GPIO - Asyncio - Json libraries
from web3 import Web3
from time import sleep
import RPi.GPIO as GPIO
import asyncio
import json

GPIO.setwarnings(False) # Set GPIO warnings off
GPIO.setmode(GPIO.BCM)  # Set GPIO mode to Broadcom SOC Channel (BCM)

# SmartDoor class definition
class SmartDoor:
    GPIO_LED = 17       # GPIO number for the LED
    GPIO_LOCK = 18      # GPIO number for the Lock
    GPIO_TIME = 10      # Time the lock is kept open

    # Class constructor - create web3 and contract instances, setup GPIO pins
    def __init__(self, blockchain_url, contract_address, contract_abi):
        # Initiate the Web3 instance referencing to the blockchain provider HTTP endpoint
        self.web3 = Web3(Web3.HTTPProvider(blockchain_url))

        # Initiate the Contract instance referencing to the contract address and ABI
        self.contract = self.web3.eth.contract(address=contract_address, abi=contract_abi)
        
        # Setup output GPIO pins for the LED and the Lock
        GPIO.setup(self.GPIO_LED, GPIO.OUT)
        GPIO.setup(self.GPIO_LOCK, GPIO.OUT)

    # Function open_door - function used to open the lock (communicate with GPIO pins)
    def open_door(self):
        # GPIO signals set to HIGH - power on the LED, open the lock
        GPIO.output(self.GPIO_LED, 1)
        GPIO.output(self.GPIO_LOCK, 1)

        # Wait for a certain number of seconds, leaving the LED on and the lock opened
        sleep(self.GPIO_TIME)

        # GPIO signals set to LOW, power off the LED, close the lock
        GPIO.output(self.GPIO_LED, 0)
        GPIO.output(self.GPIO_LOCK, 0)

    # Function handle_event - function used to handle a contract event
    def handle_event(self, event):
        # Call the function to open the door
        self.open_door()

    # Function log_loop - function used to fetch incoming events from the contract
    async def log_loop(self, event_filter, poll_interval):
        # Loop the event loop until program terminates
        while True:
            # Loop through the new entries of the "newAccess" event and pass them in the handle_event function
            for newAccess in event_filter.get_new_entries():
                self.handle_event(newAccess)

            # Retrieve again the events after a poll interval
            await asyncio.sleep(poll_interval)

    # Function run - function used to start the event loop
    def run(self):
        # Setup an event filter fetching from the latest block - setup event loop
        event_filter = self.contract.events.newAccess().create_filter(fromBlock='latest')
        loop = asyncio.get_event_loop()

        # Run the event loop, setting a filter and the poll interval
        try:
            loop.run_until_complete(asyncio.gather(self.log_loop(event_filter, 2)))
        finally:
            loop.close()

# Main function representing the script entry-point
if __name__ == "__main__":
    # Environment variables (blockchain provider endpoint - contract address - contract ABI)
    blockchain_url = 'https://rough-solitary-gas.matic-testnet.discover.quiknode.pro/95a66b31d01626a4af842562f3d780388e4e97e9/'
    contract_address = '0x8701B311CAd384D7DB2Fa63b6179ae942707e4a4'
    contract_abi = json.loads('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"newAccess","type":"event"},{"anonymous":false,"inputs":[],"name":"newReset","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"guest","type":"address"},{"indexed":false,"internalType":"string","name":"method","type":"string"}],"name":"updateGuest","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"method","type":"string"}],"name":"updateOwner","type":"event"},{"inputs":[{"internalType":"address","name":"guest","type":"address"}],"name":"acceptAuthorisation","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"accessDoor","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"address","name":"guest","type":"address"}],"name":"createAuthorisation","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"guest","type":"address"}],"name":"getAccesses","outputs":[{"components":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"guest","type":"address"}],"internalType":"struct SmartDoor.Access[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAccesses","outputs":[{"components":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"guest","type":"address"}],"internalType":"struct SmartDoor.Access[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAuthorisation","outputs":[{"components":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"guest","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"enum SmartDoor.Status","name":"status","type":"uint8"},{"internalType":"bool","name":"exists","type":"bool"}],"internalType":"struct SmartDoor.Authorisation","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getData","outputs":[{"components":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"guest","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"enum SmartDoor.Status","name":"status","type":"uint8"},{"internalType":"bool","name":"exists","type":"bool"}],"internalType":"struct SmartDoor.Authorisation[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRole","outputs":[{"internalType":"enum SmartDoor.Role","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"guest","type":"address"}],"name":"rejectAuthorisation","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"}],"name":"requestAuthorisation","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"reset","outputs":[],"stateMutability":"payable","type":"function"}]')

    # Create an instance of SmartDoor and start running the event loop 
    smartDoor = SmartDoor(blockchain_url, contract_address, contract_abi)
    smartDoor.run()