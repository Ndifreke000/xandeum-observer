import {
    peek,
    poke,
    createFile,
    bigbang,
    subscribeResult
} from '@xandeum/web3.js';
import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction
} from '@solana/web3.js';

const CONNECTION_URL = 'https://apis.devnet.xandeum.com';
// The user provided this, likely a relevant account or wallet
export const DATA_ACCOUNT_PUBKEY = new PublicKey("FBM4G63KPUneqyLwQy6zVu81AsMqmkQjsdxNGBKq3dkv");

export class XandeumSDK {
    private connection: Connection;
    private wallet: Keypair;

    constructor() {
        this.connection = new Connection(CONNECTION_URL);
        // In a real app, this would be the user's connected wallet.
        // For now, we generate a new one, but this might limit functionality (no SOL).
        this.wallet = Keypair.generate();
    }

    getConnection() {
        return this.connection;
    }

    getWallet() {
        return this.wallet;
    }

    /**
     * Reads data from a file on the Xandeum filesystem.
     * @param fsid The File System ID
     * @param path The path to the file
     * @param offset Start offset
     * @param length Number of bytes to read
     */
    async readData(fsid: string, path: string, offset: number, length: number): Promise<Record<string, unknown>> {
        try {
            console.log(`Preparing to peek at ${path} on FSID ${fsid}...`);
            const tx = await peek(fsid, path, offset, length, this.wallet.publicKey);

            // We need to send the transaction to initiate the read
            // Note: This requires the wallet to have SOL if fees are enforced.
            console.log("Sending transaction...");
            const signature = await sendAndConfirmTransaction(
                this.connection,
                tx as Transaction,
                [this.wallet]
            );
            console.log("Transaction sent:", signature);

            // Return a promise that resolves when the result is received via WebSocket
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Timeout waiting for read result"));
                }, 30000);

                subscribeResult(
                    this.connection,
                    signature,
                    (result) => {
                        clearTimeout(timeout);
                        resolve(result);
                    },
                    (err) => {
                        clearTimeout(timeout);
                        reject(err);
                    },
                    () => {
                        // Closed
                    }
                );
            });

        } catch (error) {
            console.error("Xandeum SDK Read Error:", error);
            throw error;
        }
    }

    // Helper to convert buffer result to string if needed
    parseResultToString(result: Record<string, unknown>): string {
        if (result && result.data) {
            // Assuming result.data is a Buffer or array of bytes
            try {
                return Buffer.from(result.data).toString('utf-8');
            } catch (e) {
                return JSON.stringify(result);
            }
        }
        return JSON.stringify(result);
    }
}

export const xandeumSDK = new XandeumSDK();
