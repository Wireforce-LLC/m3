import { Db, MongoClient } from "mongodb";

export default class MongoCore {
    private static _instance: MongoCore;
    private _client: MongoClient;
    private isConnected = false;
    private static _of_instance: MongoClient

    public static get instance() : MongoCore {
        if (!MongoCore._instance) {
            MongoCore._instance = new MongoCore();
        }

        return MongoCore._instance;
    }

    public static async useDatabase(): Promise<Db> {
        const client = await MongoCore.spawn();
        return client.db('m3');
    }


    public static async spawn(): Promise<MongoClient> {
        if (this._of_instance) {
            return this._of_instance
        }

        const client = new MongoCore();
        await client.attach();

        this._of_instance = client.client;

        return this._of_instance
    }
    
    constructor() {
        // Connection URL
        const url = process.env.MONGOURI || "Please set the MONGOURI environment variable";
        const client = new MongoClient(url, {
            
        });

        this._client = client;
    }

    public async connect(): Promise<MongoCore> {
        await this._client.connect();

        return this;
    }

    public async attach() {
        if (!this.isConnected) {
            await this.connect()
            this.isConnected = true;
        }
    }

    public async disconnect() {
        await this._client.close();
    }

    public get client() {
        if (!this._client) {
            throw new Error("MongoDB client not initialized");
        }

        return this._client;
    }
}