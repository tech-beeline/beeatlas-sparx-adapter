import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import useFetchJSON from "../../use-fetch.mjs";
import { AccessTimeSharp, Alarm, ExpandMore, Rule } from "@mui/icons-material";


export default function SystemAssessmentsAccordion({ system }) {
    const { data, loading, error } = useFetchJSON(`/api/v4/systems/${encodeURIComponent(system.code)}/assessments`);
    return (
        <Accordion>
            <AccordionSummary component={Paper} expandIcon={<ExpandMore />}><Rule />
                <Box fontWeight='fontWeightMedium' display='inline'>Статусы проверки фитнес-функций</Box>
            </AccordionSummary>
            {loading ? <AccessTimeSharp /> : null}
            {error ? <AccordionDetails color="red"><Alarm />{error}</AccordionDetails> : null}
            {data ?
                <AccordionDetails>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Код проверки</TableCell>
                                <TableCell>Описание проверки</TableCell>
                                <TableCell>Дата проверки</TableCell>
                                <TableCell>Результат проверки</TableCell>
                                <TableCell>Детальная информация</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody >
                            {data.map(ar =>
                                <TableRow key={ar => ar.fitness_function_code} sx={{ backgroundColor: ar.status?"green":"red" }}>
                                    <TableCell>{ar.fitness_function_code}</TableCell>
                                    <TableCell>{ar.assessment_description}</TableCell>
                                    <TableCell>{ar.assessment_date}</TableCell>
                                    <TableCell>{ar.status ? "Успешно" : "Ошибка"}</TableCell>
                                    <TableCell>{ar.result_details}</TableCell>
                                </TableRow>)}
                        </TableBody>
                    </Table>
                </AccordionDetails> : null}
        </Accordion>
    )
}