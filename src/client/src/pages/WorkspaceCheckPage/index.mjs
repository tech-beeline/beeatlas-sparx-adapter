import { Button, Header, Progress } from "@beeline/design-system-react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchJSON } from "../../utils/index.mjs";
import { ExpandMore } from "@mui/icons-material";

const COMMENT_REGEX = /^(?<header>.*)\n(?<body>(\n*.*)*)$/m

/**
 * 
 * @param {{errorComment:{ level:"error"|"warning", comment:string}}} param0 
 */
function CommentCard({ errorComment }) {
    const matched = errorComment.comment.match(COMMENT_REGEX);

    return <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}><Typography color={errorComment.level == "error" ? "red" : "blue"}>{matched?.groups.header}</Typography></AccordionSummary>
        <AccordionDetails><Box component={Paper}><pre>{matched?.groups?.body}</pre></Box></AccordionDetails>
    </Accordion>
}

export function WorkspaceCheckResultPage() {
    const { workspaceid } = useParams();
    const { loading, data, error } = useFetchJSON(`/api/v4/structirizr/${workspaceid}/json-check`);

    const loadingBox = loading && <Box>
        <Header><Typography>Идет загрузка</Typography>
            <Progress cycled={true} />
        </Header>
    </Box>
    const errorBox = error && <Box><Typography color="red">Ошибка ${error}</Typography></Box>

    console.log(data);
    const dataBox = data && <Box>
        <Header>[{data.cmdb}] {data.name} </Header>
        {data.containersComments?.map((c, i) => <CommentCard key={i} errorComment={c} />)}
    </Box>;

    return <Box>
        {loadingBox}
        {dataBox}
    </Box>
}


export function WorkspaceCheckPage() {
    const [link, setLink] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleClick = () => {
        setError(null);
        const matched = link.match(/^https:\/\/structurizr.vimpelcom.ru\/share\/(?<id>\d*)/);
        if (!matched && matched.groups?.id) {
            setError('Не корректная ссылка. Ссылка должна иметь следующие формат: https://structurizr.vimpelcom.ru/share/<workspaceid>(/.*)*')
            return;
        }
        navigate(`/structurizr/check/${matched.groups.id}`);
    }
    return <Box component={Paper}>
        <Box component={Paper}><Typography fontWeight="fontWeightBold">Введите ссылку на пространство продукта в structirizr on premise.</Typography>Например: https://structurizr.vimpelcom.ru/share/5
        </Box>
        <br />
        <TextField
            label="Ссылка на пространство продукта "
            onChange={(e) => setLink(e.target.value)}
            fullWidth
        ></TextField>
        <Button
            onClick={handleClick}
            disabled={!link?.length}>Проверить</Button>
        {error && <Box><Typography color="red">{error}</Typography></Box>}
    </Box>
}