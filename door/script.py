from web3 import Web3
import asyncio
import json

class SmartDoor:
    def __init__(self, blockchain_url, contract_address, contract_abi):
        self.web3 = Web3(Web3.HTTPProvider(blockchain_url))
        self.contract = self.web3.eth.contract(address=contract_address, abi=contract_abi)

    def handle_event(self, event):
        print(Web3.to_json(event))

        # TODO: continue code to open the door

    async def log_loop(self, event_filter, poll_interval):
        while True:
            for newAccess in event_filter.get_new_entries():
                self.handle_event(newAccess)

            await asyncio.sleep(poll_interval)

    def run(self):
        event_filter = self.contract.events.newAccess().create_filter(fromBlock='latest')
        loop = asyncio.get_event_loop()

        try:
            loop.run_until_complete(asyncio.gather(self.log_loop(event_filter, 2)))
        finally:
            loop.close()

if __name__ == "__main__":
    blockchain_url = 'https://rough-solitary-gas.matic-testnet.discover.quiknode.pro/95a66b31d01626a4af842562f3d780388e4e97e9/'
    contract_address = '0x10A66C344FEcC69CE6D34b1E5Bd1beA3C6215cA7'
    contract_abi = json.loads('[ { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" } ], "name": "newAccess", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" } ], "name": "newTicket", "type": "event" }, { "inputs": [], "name": "access", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "buy", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "hasTicket", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" } ]')

    smartDoor = SmartDoor(blockchain_url, contract_address, contract_abi)
    smartDoor.run()