export class BusinessInteraction {
    name;
    scenario;
    uid;
    constructor(obj = {}) {
        for (const k in this) {
            this[k] = obj[k] ?? this[k];
        }
    }
}