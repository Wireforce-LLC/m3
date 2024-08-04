import MongoCore from "./MongoCore";
import { Collection } from "mongodb";
import { ObjectMeta, VMECall } from "./VM";

export default class MongoData extends MongoCore {
    /**
     * Retrieves a collection of VMECall objects from the MongoDB database.
     * The collection is named "calls".
     *
     * @return {Promise<Collection<VMECall>>} A Promise that resolves to a Collection 
     *                                        containing VMECall objects.
     */
    public static async useCallsCollection(): Promise<Collection<VMECall>> {
        // Get a reference to the MongoDB database
        const db = await this.useDatabase();
        
        // Return a reference to the "calls" collection
        return db.collection("calls");
    }

    

    /**
     * Retrieves a collection of ObjectMeta objects from the MongoDB database.
     * The collection is named "objects".
     *
     * @return {Promise<Collection<ObjectMeta>>} A Promise that resolves to a Collection 
     *                                            containing ObjectMeta objects.
     */
    public static async useObjectsCollection(): Promise<Collection<ObjectMeta>> {
        // Get a reference to the MongoDB database
        const db = await this.useDatabase();
        
        // Return a reference to the "objects" collection
        return db.collection("objects"); // Collection<ObjectMeta>
    }

    /**
     * Inserts a VMECall object into the MongoDB database.
     *
     * @param {VMECall} call - The VMECall object to be inserted.
     * @return {Promise<import("mongodb").InsertOneResult>} - A Promise that resolves to the result of the insertion operation.
     */
    public static async insertCall(call: VMECall): Promise<import("mongodb").InsertOneResult> {
        // Get a reference to the "calls" collection
        const collection = await this.useCallsCollection();

        // Insert the VMECall object into the collection
        return await collection.insertOne(call);
    }

    public static async selectCall(callId: string) {
        const collection = await this.useCallsCollection();

        return await collection.findOne({ callId: callId });
    }

    /**
     * Declares a dependency for an object in the MongoDB database.
     * If the object already exists in the database, the dependency is added to the
     * object's deps array. If the object does not exist, no action is taken.
     *
     * @param {string} objectHash - The hash of the object to declare the dependency for.
     * @param {string} wantObjectId - The hash of the object that the dependency is for.
     * @return {Promise<void>} A Promise that resolves when the operation is complete.
     */
    public static async declateDep(objectHash: string, wantObjectId: string) {
        // Find the object in the database by its objectHash
        const objectMeta = await (await this.useObjectsCollection()).findOne({ objectHash: objectHash });

        // If the object exists, add the dependency to its deps array
        if (objectMeta != null) {
            await (await this.useObjectsCollection()).updateOne(
                { objectHash: objectHash }, // Find the object by its objectHash
                { $push: { deps: wantObjectId } } // Add the dependency to the deps array
            );
            return;
        }
    }

    public static async declareResultTypes(objectHash: string, resultTypes: string|Record<string, any>) {
        // Find the object in the database by its objectHash
        const objectMeta = await (await this.useObjectsCollection()).findOne({ objectHash: objectHash });

        // If the object exists, add the dependency to its deps array
        if (objectMeta != null) {
            await (await this.useObjectsCollection()).updateOne(
                { objectHash: objectHash }, // Find the object by its objectHash
                { $set: { resultTypes } } // Add the dependency to the deps array
            );
            return;
        }
    }

    /**
     * Declares an object in the MongoDB database.
     * If the object already exists in the database, it is updated.
     * If the object does not exist, it is inserted.
     *
     * @param {ObjectMeta} object - The object to be declared.
     * @return {Promise<import("mongodb").InsertOneResult | import("mongodb").UpdateWriteOpResult>} - A Promise that resolves to the result of the insertion or update operation.
     */
    public static async declareObject(object: ObjectMeta) {
        // Find the object in the database by its objectHash
        const objectMeta = await (await this.useObjectsCollection()).findOne({ objectHash: object.objectHash });

        // If the object exists, update it
        if (objectMeta != null) {
            // Update the object in the database
            const result = await (await this.useObjectsCollection()).updateOne(
                { objectHash: object.objectHash }, // Find the object by its objectHash
                { $set: object } // Update the object with the new values
            );
            return result;
        }

        // If the object does not exist, insert it
        return await (await this.useObjectsCollection()).insertOne(object);
    }

    public static async indexObjects() {
        // Get a reference to the "objects" collection
        const collection = await this.useObjectsCollection();

        return (await collection.find({})).toArray();
    }
}