const { BlockChain, Transaction } = require('./blockChain');
const	EC = require('elliptic').ec;
const	ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('ca1d6041c70201b69822f9146f7f5d8299bfe4eb01e0bc236844d1d7df0ac907');
const myWalletAddress = myKey.getPublic('hex');


let myBlockChain = new BlockChain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
myBlockChain.addTransaction(tx1);


// myBlockChain.createTransaction(new Transaction('address1', 'address2', 100));
// myBlockChain.createTransaction(new Transaction('address1', 'address2', 50));
console.log("\n...début de minage déclenché...\n");
myBlockChain.minePendingTransactions(myWalletAddress);
console.log("\nLa balance de zozo est", myBlockChain.getBalanceOfAddress(myWalletAddress));
//---Exemple de minage simple---

// console.log("Minage du block 1....");
// myBlockChain.addBlock(new Block(1, '13/11/2025', {amount : 4}));
// console.log("Minage du block 2....");
// myBlockChain.addBlock(new Block(2, '14/11/2025', {amount : 10}));

//---Affichage de la Blockchain dans le terminal---

// console.log(JSON.stringify(myBlockChain, null, 4));

//---Test de validité de la Blockchain---

// console.log("Is the chain valid ? " + myBlockChain.isChainValid());
// myBlockChain.chain[1].transactions = {amount : 100};
// myBlockChain.chain[1].hash = myBlockChain.chain[1].calculateHash();
// console.log("Is the chain valid ? " + myBlockChain.isChainValid());