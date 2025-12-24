import { ExpandMore, SettingsApplications } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Link, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";

export function SystemSummary({ system, product }) {
    return (
        <Accordion>
            <AccordionSummary component={Paper} expandIcon={<ExpandMore />}><SettingsApplications />
                <Box fontWeight='fontWeightMedium' display='inline'>Информация о продукте</Box>
            </AccordionSummary>
            <AccordionDetails>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <colgroup>
                            <col width="15%">
                            </col></colgroup>
                        <TableBody>
                            <TableRow>
                                <TableCell>Название продукта</TableCell>
                                <TableCell>{system.name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>CMDB мнемоника</TableCell>
                                <TableCell>{system.code}</TableCell>
                            </TableRow>
                            {product && <TableRow>
                                <TableCell>Рабочее простраснтво в structurizr on premises</TableCell>
                                <TableCell><Link href={product.structurizr_api_url} target="_blank">{product.structurizr_api_url}</Link></TableCell>
                            </TableRow>}
                            <TableRow>
                                <TableCell>Статус</TableCell>
                                <TableCell>{system.status}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Дата изменения</TableCell>
                                <TableCell>{system.modifiedDate}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </AccordionDetails>
        </Accordion>
    )
}