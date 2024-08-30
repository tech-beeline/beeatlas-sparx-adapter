
const SOURCE_TYPES = ["opensearch", "prometheus"]
class GrafanaSource {
    name;
    uid;
    type;
    sourceId;
    properties = {};
    constructor(name, uid) {
        this.name = name;
        this.uid = uid;
    }
    addProperty(name, value) {
        if (SOURCE_TYPES.includes(name)) {
            this.type = name;
            this.sourceId = value;
            return;
        }
        this[name] = value;
    }
}

export default GrafanaSource