import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiSystemProvidedPath, apiSystemsPath } from "../../resources/services.mjs";
import { Accordion, AccordionSummary, Alert, Box, FormControlLabel, Switch, TableBody } from "@mui/material";
import { Table, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ApiMethod, chechApi, ProvidedAPI } from "./model.mjs";
import { Progress } from "@beeline/design-system-react";
import {
    Tab,
    Tabs
} from "@beeline/design-system-react";

import { useSearchParams } from 'react-router-dom';

function SystemInfo({ code }) {
    return <>{code}</>
}

/**
 * 
 * @param {{providedApiList:Array<ProvidedAPI>}} param0 
 * @returns 
 */
function SystemProvidedApi({ providedApiList }) {

    const [hideValidMethods, setHideValidMethods] = useState(false);

    return <>
        {providedApiList && <>
            <Box>
                <FormControlLabel control={<Switch checked={hideValidMethods} onChange={() => setHideValidMethods(!hideValidMethods)}></Switch>} label="Скрыть методы, прошедшие проверку" />
            </Box>
            <Table>
                <TableHead>
                    <TableRow><TableCell>Метод</TableCell><TableCell>Интерфейс</TableCell><TableCell>пороги</TableCell><TableCell>Проверки</TableCell></TableRow>
                </TableHead>
                <TableBody>
                    {providedApiList && providedApiList.map(api => (hideValidMethods?api.methods.filter(m=>m.c4Methods.length!=1):api.methods).map(
                        (m, i) =>
                            <TableRow key={api.ea_guid + "-" + i}>
                                <TableCell>{m.name}</TableCell>
                                <TableCell>{api.name}</TableCell>
                                <TableCell><Alert severity={m.c4Methods.length == 1 ? "success" : "error"}>{m.c4Methods.length === 1 ? <>{m.c4Methods[0].sla}  <del>{m.sla}</del> </> : m.sla}</Alert></TableCell>
                                <TableCell>{m.c4Methods.length}</TableCell>
                            </TableRow>
                    ))}
                </TableBody>
            </Table></>}
    </>;
}

function SystemApiMethods({ systemMethods }) {

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

    const [searchParams, setSearchParams] = useSearchParams();


    const [error, setError] = useState();
    const [apiLoading, setApiLoading] = useState();
    /**
     * @type {[ApiMethod[]]}
     */
    const [systemMethods, setSystemMethods] = useState();
    const errorMessage = error && <Alert severity="error">{error}</Alert>;

    /** @type {[Array<ProvidedAPI>]} */
    const [providedApiList, setProvidedApiList] = useState();

    useEffect(() => {
        const loadProvidedApi = async () => {
            setError(null);
            setApiLoading(true);
            setProvidedApiList(null);
            try {
                const responce = await fetch(apiSystemProvidedPath(code));
                if (responce.status !== 200) {
                    throw Error(`Ошибка при загрузке информации об интерфейсах status=${responce.status}, message=${await responce.text()}`);
                }
                setProvidedApiList(await responce.json().then(m => m.map(i => new ProvidedAPI(i))));
            } catch (err) {
                setError(err.message);
            } finally {
                setApiLoading(null);
            }
        };

        loadProvidedApi();
    }, [code])


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
                setSystemMethods(methods);
            } catch (err) {
                setError(err.message);
            } finally {
                setApiLoading(false)
            }
        }
        loadApi();
    }, [code]);

    if (providedApiList && systemMethods) {
        chechApi(providedApiList, systemMethods);
    }

    return <>
        <Box><Typography variant="h2"> Описание интерфейсов для системы <SystemInfo code={code} /> </Typography></Box>
        <Box>
            {errorMessage}
            {apiLoading && <Progress cycled />}
            <Tabs selectedTabIndex={searchParams.get("tab")=="manual"?1:0}>
                <Tab label="Интерфейсы из Structurizr" value="structurizr" onClick={()=>setSearchParams({tab:"structuriz"})}>
                    <Box>
                        <SystemApiMethods systemMethods={systemMethods} />
                    </Box>
                </Tab>
                <Tab label="Интерфейсы, заведенные вручную" onClick={()=>setSearchParams({tab:"manual"})} key="manual">
                    <SystemProvidedApi providedApiList={providedApiList} apiMethods={systemMethods} />
                </Tab>
            </Tabs>
        </Box>
    </>;
}