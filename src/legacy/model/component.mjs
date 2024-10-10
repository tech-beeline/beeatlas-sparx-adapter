class Component {
    code;
    /**
     * @type {boolean}
     */
    name;
    description;
    author;
    createdDate;
    modifiedDate;
    status;
    package;
    fullName;
    constructor(cap) {
        for( const prop in this){
            this[prop] = cap[prop]??undefined;
        }
    }
}


export default Component;