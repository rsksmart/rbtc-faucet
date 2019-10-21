type faucetHistory = { [address: string]: boolean };

class Store { //It's a singleton!
    private static instance: Store;
    private faucetHistory: faucetHistory = {};

    private constructor() {
    }

    static getInstance(): Store {
        if (!Store.instance) {
          Store.instance = new Store();
        }
    
        return Store.instance;
    }

    alreadyDispensed(address: string): boolean {
        return this.faucetHistory[address] == true
    }

    saveDispensedAddress(address: string): void {
        this.faucetHistory[address] = true;
    }
}

export default Store;