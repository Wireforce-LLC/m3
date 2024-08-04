import fg from "fast-glob";
import fs from "node:fs";
import md5 from "md5";

export interface TreeEntity {
    path: string,
    name: string,
    type: string,
    stat: fs.Stats,
    objectHash: string
}

export class Tree {
    /**
     * Retrieves the file tree structure starting from the 'data' 
     * directory in the current working directory.
     *
     * @return {Promise<{entries: string[], cwd: string, look: string}>} A Promise that resolves to an object containing the file entries, current working directory, and the path looked for.
     */
    async getTree() {
        // Get the current working directory
        const cwd = await this.getCwd();

        // Define the path pattern to look for files
        const path = cwd + '/data/**/*.js';

        // Use the fast-glob library to retrieve the file entries matching the path pattern
        let entries = await fg.glob(path);

        const entriesList: TreeEntity[] = entries.map((entry) => {
            const name = entry.split('/').pop();
            return {path: entry, name, type: 'js', stat: fs.statSync(entry), objectHash: md5(entry)} as TreeEntity;
        });

        // Return the retrieved file entries, current working directory, and the path looked for
        return {entries: entriesList, cwd, look: path};
    }

    /**
     * Returns a Promise that resolves to the current working directory.
     *
     * @return {Promise<string>} A Promise that resolves to the current working directory.
     */
    async getCwd() {
        return process.cwd();
    }

    /**
     * Reads a file and returns its content as a string.
     */
    async safeReadFile(path: string) {
        if (!fs.existsSync(path)) return null;
        if (!fs.statSync(path).isFile()) return null;

        try {
            return await fs.promises.readFile(path, 'utf8');
        } catch (error) {
            return null;
        }
    }

    async readByObjectHash(objectHash: string) {
        const entries = await this.getTree();
        const entry = entries.entries.find((entry) => entry.objectHash === objectHash);
        if (!entry) return null;
        
        return await this.safeReadFile(entry.path);
    }

    async writeByObjectHash(objectHash: string, content: string) {
        const entries = await this.getTree();
        const entry = entries.entries.find((entry) => entry.objectHash === objectHash);
        if (!entry) return null;
        
        return await fs.promises.writeFile(entry.path, content);
    }
}