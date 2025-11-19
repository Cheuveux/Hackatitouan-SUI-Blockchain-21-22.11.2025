console.log("=== Lancement de la fusee ===\n");
const SHA256 = require('crypto-js/sha256');
const	EC = require('elliptic').ec;
const	ec = new EC('secp256k1');

class Transaction{
    constructor(addressFrom, addressTo, amount)
    {
        this.addressFrom = addressFrom;
        this.addressTo = addressTo;
        this.amount = amount;
    }

    calculateHash()
    {
        return SHA256(this.addressFrom + this.addressTo + this.amount).toString();
    }

    signTransaction(signingKey)
    {
        if (signingKey.getPublic('hex') != this.addressFrom)
            throw new Error ("Pas possible de signer des transactions d'autres protefeuilles !!");

        const hasTx = this.calculateHash();
        const sig = signingKey.sign(hasTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid()
    {
        if (this.addressFrom == null)
            return true;
        if (!this.signature || this.signature.length == 0)
                throw new Error ("No signature in this transaction !");
        
        const publicKey = ec.keyFromPublic(this.addressFrom, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

}
class	Block {
    constructor(index, timestamp, transactions, previousHash ='') 
    {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }
    calculateHash()
    {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty)
    {
        while(this.hash.substring(0, difficulty) != Array(difficulty + 1).join("0"))
        {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Le block est miné : " + this.hash);
    }

    hasvalidTransactions()
    {
        for (const tx of this.transactions){
            if (!tx.isValid())
                return false;
        }
        return true;
    }
}

class	BlockChain {
    constructor()
    {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock()
    {
        return new Block(0, "13/11/2025", [], "0");
    }

    getLatestBlock()
    {
        return this.chain[this.chain.length-1];
    }
    
    minePendingTransactions(miningRewardAddress)
    {
        let block = new Block(this.chain.length, Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log('Le block est miné !');
        this.chain.push(block);

        this.pendingTransactions = 
        [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    addTransaction(transaction)
    {
        if (!transaction.addressFrom || !transaction.addressTo)
            throw new Error("Transaction must intclude from and to adress");
        if(!transaction.isValid())
            throw new Error("Cannot add invalid transaction to chain");
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address)
    {
        let balance = 0;

        for(const block of this.chain)
        {
            for(const trans of block.transactions)
            {
                if(!trans) continue;
                if(trans.addressFrom === address)
                    balance -= trans.amount;
                if(trans.addressTo === address)
                    balance += trans.amount;
            }
        }
        return balance;
    }
    isChainValid()
    {
        let i = 1; // on commence après le genesis block
        while (i < this.chain.length)
        {
            const	currentBlock = this.chain[i];
            const	previousBlock = this.chain[i - 1];

            if (!currentBlock.hasvalidTransactions())
                return false;
            if (currentBlock.hash != currentBlock.calculateHash())
                return false;
            if(currentBlock.previousHash != previousBlock.hash)
                return false;
            i++;
        }
        return true;
    }
}


module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;
