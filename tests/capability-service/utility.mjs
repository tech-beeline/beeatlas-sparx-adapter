import { SparxRepository } from "../../src/api/repositories/index.mjs";
import { updateEnv } from "../env.mjs";

export async function beforeCreateFoolState(){
    updateEnv();
    const repository = new SparxRepository();
}