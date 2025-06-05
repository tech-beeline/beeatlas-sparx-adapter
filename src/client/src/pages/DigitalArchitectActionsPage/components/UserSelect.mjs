import * as React from 'react';
import { Autocomplete, Box, TextField } from "@mui/material";
import { DIGITAL_ARCHITECT_RESOURCE } from "../../../resources/services.mjs";
import { useEffect, useState } from "react";
import { Progress } from "@beeline/design-system-react";


export function UserSelect({ login, setLogin }) {

    /** @type {[{login:string}[],]} */
    const [users, setUsers] = useState();
    const [loadingUsers, setLoadingUsers] = useState();
    const [error, setError] = useState();

    useEffect(() => {
        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                setError(null);
                const response = await fetch(DIGITAL_ARCHITECT_RESOURCE);
                if (response.status !== 200) throw Error(await response.text());
                setUsers(await response.json())
            } catch (error) {
                setError(error.message);
            } finally {
                setLoadingUsers(false);
            }
        }
        loadUsers();
    }, []);

    const errorBox = error && <Box>Ошибка загрузки пользователей:{error}</Box>
    const progressBar = loadingUsers && <Box>Загрузка списка пользователей<Progress cycled /></Box>


    const options = users?.filter(u => u.login).map(u => u.login) ?? []

    return progressBar || errorBox || <Autocomplete
        value={login}
        options={options}
        disablePortal
        renderInput={(params) => <TextField {...params} label="Пользователь" />}
        onChange={(ev, value) => { setLogin?.(value) }}
    />
}