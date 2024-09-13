import { Autocomplete, Popper, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { E2E_API_RESOURCE } from "../../const.mjs";

import styles from "./E2EProcessSelect.module.css";

const CustomPopper = (props) => {
    return <Popper {...props} placement="bottom" />;
};

export function E2EProcessSelect({ onSelect, process }) {
    const [processList, setProcessList] = useState(null);

    const loadProcessList = async () => {
        const response = await fetch(E2E_API_RESOURCE);
        if (response.status !== 200) {
            setProcessList({
                error: `HTTP STATUS: ${response.status} ( ${response.statusText})`,
                errorBody: await response.text(),
            });
            return;
        }

        let apps = (await response.json()).filter((r) => r.status !== "EOL");

        setProcessList(apps);
    };

    useEffect(() => {
        loadProcessList();
    }, []);

    const handleChange = (event, value) => {
        if (value) {
            onSelect?.(value);
        }
    };

    return (
        <Autocomplete
            fullWidth
            disablePortal
            variant="outlined"
            className={styles.autocomplete}
            PopperComponent={CustomPopper}
            value={
                process
                    ? {
                          label: `${process?.name}, version ${process?.version}`,
                          ...process,
                      }
                    : { label: "" }
            }
            onChange={handleChange}
            options={
                processList?.map?.((o, i) => ({
                    label: `${o.name}, version ${o.version}`,
                    ...o,
                })) ?? []
            }
            isOptionEqualToValue={(o, v) => o?.uid === v?.uid}
            renderInput={(params) => (
                <TextField {...params} variant="outlined" fullWidth />
            )}
        />
    );
}
