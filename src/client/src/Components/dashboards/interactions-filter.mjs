//import { NavLink, useParams } from "react-router-dom";
import React from 'react';

import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";

export class FilterState {
    static iaFilterFunction = [
        o => true,
        o => !o.notDefinedIACount,
        o => o.notDefinedIACount
    ];
    static rpsFilterFunction = [
        o => true,
        o => !o.notDefinedRPSCount,
        o => o.notDefinedRPSCount
    ]
    static latencyFilterFunction = [
        o => true,
        o => !o.notDefinedLatencyCount,
        o => o.notDefinedLatencyCount
    ]
    static errorFilterFunction = [
        o => true,
        o => !o.notDefinedErrorCount,
        o => o.notDefinedErrorCount
    ]
    constructor(o) {
        Object.assign(this, o);
    }
    iaFilter = 0;
    rpsFilter = 0;
    latencyFilter = 0;
    errorFilter = 0;

    setIAFilter(iaFilter) {
        this.iaFilter = iaFilter;
        return this;
    }
    setRPSilter(rpsFilter) {
        this.rpsFilter = rpsFilter;
        return this;
    }

    setLatencyFilter(latencyFilter) {
        this.latencyFilter = latencyFilter;
        return this;
    }
    setErrorFilter(errorFilter) {
        this.errorFilter = errorFilter;
        return this;
    }
    check(i) {
        return FilterState.iaFilterFunction[this.iaFilter](i)
            && FilterState.rpsFilterFunction[this.rpsFilter](i)
            && FilterState.latencyFilterFunction[this.latencyFilter](i)
            && FilterState.errorFilterFunction[this.errorFilter](i);
    }
}

function filterBox(id, label, options, value, cb = () => { }) {
    const labelid = `${label}-label`;
    return <Box>
        <FormControl sx={{ width: 200 }}>
            <InputLabel id={labelid}>{label}</InputLabel>
            <Select value={value} labelId={labelid} id={id} label={label} onChange={cb}>
                {options.map((o, i) => <MenuItem value={i} key={i}>{o}</MenuItem>)}
            </Select>
        </FormControl>
    </Box>
}

export function InteractionFilter({ filterState, setFilterState }) {
    return <div style={{ display: "flex" }}>
        {filterBox('ia-filter', 'Статус IA', ["Все", "Есть", "Нет"], filterState.iaFilter, (event) => setFilterState(new FilterState(filterState).setIAFilter(event.target.value)))}
        {filterBox('rps-filter', 'RPS', ["Все", "Есть", "Нет"], filterState.rpsFilter, (event) => setFilterState(new FilterState(filterState).setRPSilter(event.target.value)))}
        {filterBox('latency-filter', 'Latence', ["Все", "Есть", "Нет"], filterState.latencyFilter, (event) => setFilterState(new FilterState(filterState).setLatencyFilter(event.target.value)))}
        {filterBox('error-filter', 'Error', ["Все", "Есть", "Нет"], filterState.errorFilter, (event) => setFilterState(new FilterState(filterState).setErrorFilter(event.target.value)))}
    </div>
}