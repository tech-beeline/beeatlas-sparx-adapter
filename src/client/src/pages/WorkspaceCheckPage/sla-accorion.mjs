import { Button, Typography } from "@beeline/design-system-react";
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Box } from "@mui/material";
import { useState } from "react";

export function SLATemplateAccordion({ preview }) {
    const apiList = preview?.containers?.reduce((list, c) => [...list, ...c.interfaces ?? []], []);

    const [alert, setAlert] = useState();

    const sla = apiList?`sla: 1.0.0 # версия формата SLA
info:
  title: SLA для приложения ${preview.name}
  description: CMDB=${preview.cmdb}
  version: 0.0.1 #версия SLA
rest:
${apiList.map(api => `  ${api.identifier}: # SLA для "${api.name}"
    "/endpoint": #endpoint, для которого описывается SLA
      get: #http method
        rps: 100 # максмиальная нагрузка на метод GET /endpoint, запросы в секунду
        latency: 1000 # Максимальное время отклика метода GET /endpoint при нормальном профиле нагрузки, микросекунды
        error_rate: 0.1 # Допустимый процент ошибок, %`).join('\n')}
`:null;

    return apiList?.length ? <Accordion>
        <AccordionSummary>Шаблон SLA</AccordionSummary>
        <AccordionActions>
            {alert&&<Box><Typography color="green">{alert}</Typography></Box>}
            <Button onClick={() => {
                navigator.clipboard.writeText(sla)
                setAlert("Шаблон скопирован!")
                setTimeout(() => {
                    setAlert(null);
                }, 3000);
            }}>Скопировать</Button>
        </AccordionActions>
        <AccordionDetails>
            <Typography>Шаблон предплагает, что в архитектуре описаные rest интефрейсы</Typography>
            <Box sx={{ bgcolor: "black" }} color="white"><pre color="white">{sla}</pre></Box>
        </AccordionDetails>
    </Accordion> : null;
}