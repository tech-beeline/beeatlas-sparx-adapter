import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiSystemsPath } from "../../resources/services.mjs";
import { Alert, Box, TableBody } from "@mui/material";
import { Table, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ApiMethod } from "./model.mjs";
import { Progress } from "@beeline/design-system-react";


function SystemInfo({ code }) {
    return <>{code}</>
}

function SystemApiMethods({ code }) {

    const [error, setError] = useState();
    const [apiLoading, setApiLoading] = useState();
    /**
     * @type {[ApiMethod[]]}
     */
    const [systemMethods, setSystemMethods] = useState();


    useEffect(() => {
        const loadContainers = async () => {
            const responce = await fetch(apiSystemsPath(code));
            if (responce.status !== 200) {
                throw Error(`Ошибка при загрузке информации о контейнерах status=${responce.status}, message=${await responce.text()}`);
            }
            return responce.json();
        }
        const loadApi = async () => {
            try {
                setSystemMethods(null);
                setApiLoading(true);

                const methods = [];
                const structurizrApi = await loadContainers();
                console.log(structurizrApi);

                for (const c of structurizrApi.containers ?? []) {
                    const containerInfo = `${c.name}`;
                    for (const api of c.interfaces ?? []) {
                        const apiInfo = `[${api.code}] ${api.name}`;
                        for (const m of api.methods ?? []) {
                            m.apiInterface = apiInfo;
                            m.containerInfo = containerInfo;
                            methods.push(new ApiMethod(m))
                        }
                    }
                }
                console.log(methods);
                setSystemMethods(methods);
            } catch (err) {
                setError(err.message);
            } finally {
                setApiLoading(false)
            }
        }
        loadApi();
    }, [code])
    const errorMessage = error && <TableRow><TableCell colSpan={6}><Alert severity="error">{error}</Alert></TableCell></TableRow>;


    return <Table>
        <TableHead>
            <TableRow>
                <TableCell>Контейнер</TableCell>
                <TableCell>Интерфейс</TableCell>
                <TableCell>Метод</TableCell>
                <TableCell>SLA</TableCell>
                <TableCell>TC интерфейса</TableCell>
                <TableCell>ТС метода</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {errorMessage}
            {apiLoading && <TableRow> <TableCell colSpan={6}><Progress cycled /></TableCell></TableRow>}
            {systemMethods && systemMethods.map(m =>
                <TableRow>
                    <TableCell>{m.containerInfo}</TableCell>
                    <TableCell>{m.apiInterface}</TableCell>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>{m.sla}</TableCell>
                </TableRow>)}
        </TableBody>
    </Table>
}

export function SystemAPIPage() {
    const { code } = useParams();


    return <>
        <Box><Typography variant="h2"> Описание интерфейсов для системы <SystemInfo code={code} /> </Typography></Box>
        <Box>
            <SystemApiMethods code={code} />
        </Box>
    </>;
}