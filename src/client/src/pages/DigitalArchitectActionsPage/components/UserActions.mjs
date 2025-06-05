import { Box, Collapse, IconButton, List, ListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { architectActionResource } from "../../../resources/services.mjs";
import { Progress } from "@beeline/design-system-react";
import { Link } from "react-router-dom";
import { SystemLink } from "../../../components/index.mjs";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

class ActionStat {
    totalEvents = 0;
    start = 0;
    autocomplite = 0;
    hover = 0;
    template = 0;
    templateDetails = {}
    systemCode;
    constructor(code) {
        this.systemCode = code;
    }
}

function TemplateStat({ stat }) {
    const [open, setOpen] = useState(false);

    console.log(stat);
    return stat?.template && <TableCell>
        <Table>
            <TableBody>
                {<TableRow><TableCell><IconButton onClick={() => setOpen(!open)}>{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />} </IconButton> Всего</TableCell><TableCell>{stat.template}</TableCell></TableRow>}
                {open && Object.entries(stat.templateDetails).map(t => <TableRow key={t[0]}><TableCell>{t[0]}</TableCell><TableCell>{t[1].count}</TableCell></TableRow>)}
            </TableBody>
        </Table>
    </TableCell>
}

export function UserActions({ login }) {

    const [error, setError] = useState();
    const [loading, setLoading] = useState();
    const [actions, setActions] = useState();

    const totalTitle = "Всего";
    const unknownTitle = "Не указано";

    const buildStat = () => {
        if (!actions)
            return {};

        const totalStat = new ActionStat();
        const systems = {
            [totalTitle]: totalStat
        };

        for (let { action, cmdb, count, template_id } of actions) {
            /** @type {ActionStat[]} */
            const stats = [
                systems[cmdb || unknownTitle] ?? (systems[cmdb || unknownTitle] = new ActionStat(cmdb)),
                totalStat
            ];
            let cnt = Number(count);
            stats.forEach(s => {
                s.totalEvents += cnt
                s[action] = (s[action] ?? 0) + cnt;
                if (action === 'template') {
                    template_id = template_id ?? "--";
                    (s.templateDetails[template_id] ?? (s.templateDetails[template_id] = { count: 0 })).count += cnt;
                }
            });
        };

        return Object.entries(systems).map(s => ({ name: s[0], stat: s[1] }));
    }

    useEffect(() => {
        const loadUserActions = async () => {
            try {
                setError(null);
                setLoading(true)
                const response = await fetch(architectActionResource(login));
                if (response.status !== 200) throw Error(await response.text());
                setActions(await response.json())
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(null);
            }
        }
        loadUserActions();
    }, [login]);

    const systemsStat = buildStat(actions);

    console.log(systemsStat);
    const errorBox = error && <Box><Typography component={Paper} color="red" />Ошибка: {error}</Box>
    const loadingBox = loading && <Box>Загрузка информации<Progress cycled /></Box>
    return (<Box >{loadingBox || errorBox || (actions && <>
        <Box component={Paper}>
            <Typography variant="h5">Общая статистика</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <colgroup>
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '40%' }} />
                    </colgroup>
                    <TableHead>
                        <TableRow>
                            <TableCell>Продукт</TableCell>
                            <TableCell>Всего событий</TableCell>
                            <TableCell>Запусков плагина</TableCell>
                            <TableCell>Автокомлит</TableCell>
                            <TableCell>Подсказки</TableCell>
                            <TableCell>Шаблоны</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {systemsStat.map(s => <TableRow>
                            <TableCell>{s.stat.systemCode ? <SystemLink systemCode={s.stat.systemCode} /> : s.name}</TableCell>
                            <TableCell>{s.stat.totalEvents}</TableCell>
                            <TableCell>{s.stat.start}</TableCell>
                            <TableCell>{s.stat.autocomplite}</TableCell>
                            <TableCell>{s.stat.hover}</TableCell>
                            <TemplateStat stat={s.stat} />
                        </TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    </>)}
    </Box>)
}