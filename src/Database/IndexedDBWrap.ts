import {UtilityBackoffManager} from "../Utility/UtilityBackoffManager";


export type ObjectStoreConfigs = [
    {
        name: string;
        options?: IDBObjectStoreParameters;
    },
    ...{
        name: string;
        options?: IDBObjectStoreParameters;
    }[]
]

/**
 * Simple wrapper around IndexedDB to make it easier to use for logging.
 */
export class IndexedDBWrap {
    readonly name: string;
    readonly objectStores: ObjectStoreConfigs;
    private db: IDBDatabase | null = null;
    private isOpen: Promise<boolean>;
    private isInitializationStarted: boolean = false;
    private resolveIsOpen: (value: boolean) => void;
    private rejectIsOpen: (reason: Error) => void;
    private addBackoff: UtilityBackoffManager = new UtilityBackoffManager(3, 100, 1000, 5);

    constructor(dbName: string, objectStores: ObjectStoreConfigs) {
        this.name = dbName;
        this.objectStores = objectStores;
        this.isOpen = this.resetIsOpen();
    }

    /**
     * Initializes the IndexedDB database and creates object stores specified in the constructor, if they do not already exist.
     * @returns Promise that resolves to true if the database is successfully initialized, or false if it fails to initialize.
     */
    async init(): Promise<boolean> {
        this.isInitializationStarted = true;
        const request = indexedDB.open(this.name, 1);
        request.onupgradeneeded = () => this.handleUpgrade(request.result);
        request.onsuccess = () => this.handleSuccess(request.result);
        request.onerror = () => this.handleError(request.error);
        return this.isOpen;
    }

    /**
     * Closes the IndexedDB database.
     */
    close(): void {
        if (this.db) {
            this.isInitializationStarted = false;
            this.db.close();
            this.db = null;
            this.isOpen = this.resetIsOpen();
        }
    }

    private resetIsOpen(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.resolveIsOpen = resolve;
            this.rejectIsOpen = reject;
        });
    }

    private handleUpgrade(database: IDBDatabase) {
        this.db = database;
        this.objectStores.forEach((objectStoreConfig) => {
            if (!database.objectStoreNames.contains(objectStoreConfig.name)) {
                database.createObjectStore(objectStoreConfig.name, objectStoreConfig.options);
            }
        });
    }
    private handleSuccess(database: IDBDatabase) {
        this.db = database;
        this.resolveIsOpen(true);
    }

    private handleError(e: DOMException) {
        console.warn("IndexedDBWrap error:", e);
        this.rejectIsOpen(e);
    }

    /**
     * Adds a new record to the specified object store.
     * @param objectName - The name of the target object store.
     * @param object - The data object to be added.
     * @returns Promise that resolves when the record is successfully added, or rejects if there is an error.
     * @throws Error If the database is not initialized.
     */
    async add(objectName: string, object: any): Promise<void> {
        if (!this.isInitializationStarted) throw new Error("IndexedDBWrap is not initialized.");
        await this.isOpen;
        if (!this.db) throw new Error("IndexedDBWrap is not open.");
        return this.addBackoff.execute(async () => {
           return this.performAddTransaction(objectName, object);
        });
    }

    private performAddTransaction(objectName: string, object: Record<string, any>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction([objectName], "readwrite");
            const objectStore = transaction.objectStore(objectName);
            const request = objectStore.add(object);

            request.onsuccess = () => {
                console.info("IndexedDBWrap: add() success");
                resolve();
            };

            request.onerror = () => {
                console.warn("IndexedDBWrap: add() error:", request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Gets all records from the specified object store.
     * Should be used with caution as getting all records can cause performance issues.
     * TODO: Consider adding a cursor to get records in batches.
     * @param objectName
     * @returns Promise that resolves to an array of records, or rejects if there is an error.
     * @throws Error If the database is not initialized.
     */
    async getAll(objectName: string): Promise<any[]> {
        if (!this.isInitializationStarted) throw new Error("IndexedDBWrap is not initialized.");
        await this.isOpen;
        return new Promise<any[]>((resolve, reject) => {
            if (!this.db) throw new Error("IndexedDBWrap is not open.");
            const transaction = this.db.transaction([objectName], "readonly");
            const objectStore = transaction.objectStore(objectName);
            const request = objectStore.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            }

            request.onerror = () => {
                reject(request.error);
            }
        });
    }

    /**
     * Deletes all records from the specified object store.
     * Be cautious as it will delete all records from the object store and cannot be undone.
     * @param objectName - The name of the target object store.
     * @returns Promise that resolves when the object store is successfully cleared, or rejects if there is an error.
     */
    async drop(objectName: string): Promise<void> {
        if (!this.isInitializationStarted) throw new Error("IndexedDBWrap is not initialized.");
        await this.isOpen;
        return new Promise<void>((resolve, reject) => {
            if (!this.db) throw new Error("IndexedDBWrap is not open.");
            const transaction = this.db.transaction([objectName], "readwrite");
            const objectStore = transaction.objectStore(objectName);
            const request = objectStore.clear();

            request.onsuccess = () => {
                resolve();
            }

            request.onerror = () => {
                reject(request.error);
            }
        });
    }
}