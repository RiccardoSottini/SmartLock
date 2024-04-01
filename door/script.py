# Import Web3 - Time - RPi.GPIO - Asyncio - Json libraries
from web3 import Web3
from time import sleep
import RPi.GPIO as GPIO
import asyncio
import json

GPIO.setwarnings(False) # Set GPIO warnings off
GPIO.setmode(GPIO.BCM)  # Set GPIO mode to Broadcom SOC Channel (BCM)

class SmartDoor:
    GPIO_LED = 17       # GPIO number for the LED
    GPIO_LOCK = 18      # GPIO number for the Lock
    GPIO_TIME = 10      # Time the lock is kept open

    # Class constructor - create web3 and contract instances, setup GPIO pins
    def __init__(self, provider_endpoint, contract_address, contract_abi):
        # Initiate the Web3 instance referencing to the blockchain provider HTTP endpoint
        self.web3 = Web3(Web3.HTTPProvider(provider_endpoint))

        # Initiate the Contract instance referencing to the contract address and ABI
        self.contract = self.web3.eth.contract(address=contract_address, abi=contract_abi)
        
        # Setup output GPIO pins for the LED and the Lock
        GPIO.setup(self.GPIO_LED, GPIO.OUT)
        GPIO.setup(self.GPIO_LOCK, GPIO.OUT)

    # Function open_door - function used to open the lock (communicate with GPIO pins)
    def open_door(self, event):
        # GPIO signals set to HIGH - power on the LED, open the lock
        GPIO.output(self.GPIO_LED, 1)
        GPIO.output(self.GPIO_LOCK, 1)

        # Wait for a certain number of seconds, leaving the LED on and the lock opened
        sleep(self.GPIO_TIME)

        # GPIO signals set to LOW, power off the LED, close the lock
        GPIO.output(self.GPIO_LED, 0)
        GPIO.output(self.GPIO_LOCK, 0)

    # Function log_loop - function used to fetch incoming events from the contract
    async def log_loop(self, event_filter, poll_interval):
        # Event loop runs until program terminates
        while True:
            # Loop through the new entries of the "newAccess" event and pass them in the open_door function
            for newAccess in event_filter.get_new_entries():
                self.open_door(newAccess)

            # Retrieve again the events after a poll interval
            await asyncio.sleep(poll_interval)

    # Function run - function used to start the event loop
    def run(self):
        # Subscribe to an event listener fetching from the latest block
        event_filter = self.contract.events.newAccess().create_filter(fromBlock='latest')
        loop = asyncio.get_event_loop()

        # Run the event loop, setting a filter and the poll interval
        try:
            loop.run_until_complete(asyncio.gather(self.log_loop(event_filter, 2)))
        finally:
            loop.close()

# Main function representing the script entry-point
if __name__ == "__main__":
    # Import configuration from config.json
    config_file = open("config.json")
    config_data = json.load(config_file)

    # Environment variables (blockchain provider endpoint - contract address - contract ABI)
    provider_endpoint = config_data['provider_endpoint']
    contract_address = config_data['contract_address']
    contract_abi = config_data['contract_abi']

    # Create an instance of SmartDoor and start running the event loop 
    smartDoor = SmartDoor(provider_endpoint, contract_address, contract_abi)
    smartDoor.run()