import { v4 as uuid } from 'uuid'

export class t_connector {
    connector_id;
    name;
    direction;
    notes;
    connector_type;
    subtype;
    sourcecard;
    sourceaccess;
    sourceelement;
    destcard;
    destaccess;
    destelement;
    sourcerole;
    sourceroletype;
    sourcerolenote;
    sourcecontainment;
    sourceisaggregate;
    sourceisordered;
    sourcequalifier;
    destrole;
    destroletype;
    destrolenote;
    destcontainment;
    destisaggregate;
    destisordered;
    destqualifier;
    start_object_id;
    end_object_id;
    top_start_label;
    top_mid_label;
    top_end_label;
    btm_start_label;
    btm_mid_label;
    btm_end_label;
    start_edge;
    end_edge;
    ptstartx;
    ptstarty;
    ptendx;
    ptendy;
    seqno;
    headstyle;
    linestyle;
    routestyle;
    isbold;
    linecolor;
    stereotype;
    virtualinheritance;
    linkaccess;
    pdata1;
    pdata2;
    pdata3;
    pdata4;
    pdata5;
    diagramid;
    ea_guid = `{${uuid().toUpperCase()}}`;
    sourceconstraint;
    destconstraint;
    sourceisnavigable;
    destisnavigable;
    isroot;
    isleaf;
    isspec;
    sourcechangeable;
    destchangeable;
    sourcets;
    destts;
    stateflags;
    actionflags;
    issignal;
    isstimulus;
    dispatchaction;
    target2;
    styleex;
    sourcestereotype;
    deststereotype;
    sourcestyle;
    deststyle;
    eventflags;
    
    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
}