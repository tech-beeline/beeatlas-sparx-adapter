import { Autocomplete, Popper, TextField } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useState } from "react";
import { SYSTEM_RESOURCE } from "../../resources/services.mjs";


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


    const [app_list, setAppList] = useState(null)

    const loadApplications = async () => {
        const response = await fetch(SYSTEM_RESOURCE)
        if (response.status !== 200) {
            setAppList({ error: `HTTP STATUS: ${response.status} ( ${response.statusText})`, errorBody: await response.text() })
            return;
        }

        let apps = (await response.json()).filter(r => r.status !== 'EOL').reduce( (acc,v)=>(acc[v.code]=v,acc),{})
        apps = Object.values(apps);

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