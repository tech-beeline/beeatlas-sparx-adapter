import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { E2EScenarioDashboard_URI } from './e2e-scenarios-page.mjs';
import { WebEANaviLine, webEALink } from '../../utils.mjs';


export const E2EProcessSummary_URI = "/e2e/processes";

function E2ESummary({ summary , uid}) {
    console.log(summary)
    return summary ? <div>
        <h1>{summary.name} <WebEANaviLine uid={uid}/></h1>
    </div> : <div>Loading ...</div>
}


function BusinessInteractionList({ interactions , process_uid}) {

    console.log( interactions)
    return interactions?<div>
        <h2>Business Interactions</h2>
        {interactions.map(it => <h3><a href={`${E2EProcessSummary_URI}/${process_uid}/bi/${encodeURIComponent(it.ea_guid)}`}>{it.bi_name}</a>
        {it.alert?<h4>{it.alert}</h4>:null}
        </h3>)}
    </div>:<div>Loading ...</div>
}
export default function E2EProcessSummary() {

    const { uid } = useParams();


    const [summary, setSummary] = useState(null);

    const [businessIneractions, setBusinessIneractions] = useState(null);


    const featchInteractions = async () => {
        const response = await fetch(`/api/v1/e2e-processes/${encodeURIComponent(uid)}/business-interactions`)
        if (response.status !== 200) {
            return setBusinessIneractions({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() });
        }
        setBusinessIneractions(await response.json())
    }

    const featchSummary = async () => {
        const response = await fetch(`/api/v1/e2e-processes/${encodeURIComponent(uid)}`)
        if (response.status !== 200) {
            return setSummary({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() });
        }
        setSummary(await response.json())
    }

    useEffect(() => {
        featchInteractions();
        featchSummary();
    }, [])
    return <div><E2ESummary summary={summary} uid={uid}> </E2ESummary>
        <BusinessInteractionList interactions={businessIneractions} process_uid={uid}/>
    </div>
}