import { Autocomplete, Popper, TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useState } from "react";

const useStyles = makeStyles(theme => ({
    inputRoot: {
        color: "rgba(0, 0, 0, 0.87)"
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

export function SystemSelect({ onSelect, system }) {

    const classes = useStyles();

    const [app_list, setAppList] = useState(null)

    const loadApplications = async () => {
        const response = await fetch(`/api/v1/systems`)
        if (response.status !== 200) {
            setAppList({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() })
            return;
        }

        let apps = (await response.json()).filter(r => r.status !== 'EOL')

        setAppList(apps)
    }

    useEffect(() => {
        loadApplications();
    }, []);

    const handleChange = (event, value) => {
        if (value) {
            onSelect?.(value);
        }
    }

    return (
        <Autocomplete
            value={system ? { label: system?.name ?? "", code: system?.code ?? "" } : ""}
            sx={{ width: "350px" }}
            componentsProps={{ popper: { style: { width: 'fit-content' } } }}
            disablePortal
            PopperComponent={CustomPopper}
            classes={classes}
            fullWidth
            isOptionEqualToValue={(o, v) => o.code === v.code}
            options={app_list?.map?.((o, i) => ({ label: o.name, code: o.code })) ?? []}
            renderInput={(params) =>
                <TextField {...params}
                    variant="outlined"
                    fullWidth
                />}
            onChange={handleChange}>
        </Autocomplete>)
}