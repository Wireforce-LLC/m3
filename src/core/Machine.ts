import NodeCache from "node-cache";

export default class Machine {
    static cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
    static lazyValues = new Map();
}