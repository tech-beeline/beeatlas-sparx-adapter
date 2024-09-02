import { Autocomplete, Popper, TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useState } from "react";
import { E2E_API_RESOURCE } from "../const.mjs";

const useStyles = makeStyles(theme => ({
    inputRoot: {
        color: "white"
    }
}));


const CustomPopper = (props) => {
    return (
        <Popper
            {...props}
            placement="bottom"
            sx={{
                height: "10px",
            }}
            style={{ width: props.anchorEl.clientWidth, height: "5px" }}
        />
    );
};

export function E2EProcessSelect({ onSelect, process }) {

    const classes = useStyles();

    const [processList, setProcessList] = useState(null)

    const loadProcessList = async () => {
        const response = await fetch(E2E_API_RESOURCE)
        if (response.status !== 200) {
            setProcessList({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() })
            return;
        }

        let apps = (await response.json()).filter(r => r.status !== 'EOL')

        setProcessList(apps)
    }

    useEffect(() => {
        loadProcessList();
    }, []);

    const handleChange = (event, value) => {
        if (value) {
            onSelect?.(value);
        }
    }

    return (
        <Autocomplete
            value={ process?{ label: `${process?.name}, version ${process?.version}`, ...process }:{label:""}}
            sx={{ width: "350px" }}
            componentsProps={{ popper: { style: { width: 'fit-content' } } }}
            disablePortal
            PopperComponent={CustomPopper}
            classes={classes}
            fullWidth
            isOptionEqualToValue={(o, v) => o?.uid === v?.uid}
            options={processList?.map?.((o, i) => ({ label: `${o.name}, version ${o.version}`, ...o })) ?? []}
            renderInput={(params) =>
                <TextField {...params} 
                variant="outlined" 
                fullWidth />}
            onChange={handleChange}>
        </Autocomplete>)
}