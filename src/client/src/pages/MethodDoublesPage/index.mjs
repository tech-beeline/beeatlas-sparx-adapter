import { Header } from "@beeline/design-system-react";
import {
    KeyboardArrowDown,
    KeyboardArrowUp
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    TableHead,
    Collapse,
    IconButton,
    Link,
    Drawer
} from "@mui/material";
import { useEffect, useState } from "react";
import { DoubleRow } from "./components/double-row.mjs";
import { MethodsDoublesAppBar } from "./components/doubles-bar.mjs";



function InterfaceRow({ api }) {
    const [opened, setOpened] = useState(false);

    return <>
        <TableRow>
            <TableCell>
                <IconButton size="small" onClick={() => setOpened(!opened)} >{opened ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>
            </TableCell>
            <TableCell>
                {api.name}
            </TableCell>
            <TableCell>
                {api.code}
            </TableCell>
            <TableCell>
                <Link href={`https://ms-seaapp001.bee.vimpelcom.ru:83?m=1&o=${api.uid}`} target="_blank" rel="noreferer">{api.FQName}</Link>
            </TableCell>
        </TableRow>
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                <Collapse in={opened}>
                    {Object.entries(api.doubles).map(([name, methods]) => <DoubleRow key={name} name={name} methods={methods} />)}
                </Collapse>
            </TableCell>
        </TableRow>
    </>
}


export function MethodDoublesPage() {
    /** @type {[Array<{ name:string }>]} */
    const [doubles, setDoubles] = useState();
    const [error, setError] = useState();

    /** @type {[{apiFilter:string, methodFilter:string}]} */
    const [filter, setFilter] = useState();

    const filterDoubles = () => {
        if (!filter) return doubles;


        let ret = (filter.apiFilter ? doubles.filter(d => d.name.toLocaleLowerCase().includes(filter.apiFilter.toLocaleLowerCase())) : doubles)
            .map(it => ({ ...it }));

        if (filter.methodFilter) {
            for (const api of ret) {
                const filtered = {}
                for (const name in api.doubles) {
                    if (name.includes(filter.methodFilter.toLowerCase()))
                        filtered[name] = api.doubles[name]
                }
                api.doubles = filtered;
            }
        }
        ret = ret.filter(api => Object.keys(api.doubles).length)

        return ret;
    }

    const filtered = doubles && filterDoubles();

    useEffect(() => {
        async function loadDoubles() {
            try {
                const responce = await fetch('/api/v4/maintenance/methods-doubles');
                if (responce.status !== 200) {
                    throw Error(await responce.text())
                }
                setDoubles(await responce.json());
            } catch (err) {
                setError(err.message);
            }
        };
        loadDoubles();
    }, []);

    const doublesTable = <Box>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Интерфейс</TableCell>
                        <TableCell>Код интерфейса</TableCell>
                        <TableCell>Где находится</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filtered && filtered.map(d => <InterfaceRow key={d.uid} api={d} />)}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>

    return <Box>
        <MethodsDoublesAppBar setFilter={setFilter} />
        {doublesTable}
        {error && <Box>
            <Alert severity="error">
                {error}
            </Alert>
        </Box>}
    </Box>
}