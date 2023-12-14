export function mapFromArray( data, keyFn){
    if( !Array.isArray(data)){
        throw Error( `data is not array`)
    }
    let ret = {};
    let key_fn = keyFn;
    if( typeof keyFn=== "string"){
        key_fn = (d)=>d[keyFn];
    }
    for( const item of data){
        ret[key_fn(item)] = item;
    }
    return ret;
}