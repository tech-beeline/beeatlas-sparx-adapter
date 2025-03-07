import { SparxRepository } from "../../src/api/repositories/index.mjs";
import { readEnv } from "../env.mjs";

export async function beforeCreateFoolState(){
    readEnv();
    const repository = new SparxRepository();
    
}