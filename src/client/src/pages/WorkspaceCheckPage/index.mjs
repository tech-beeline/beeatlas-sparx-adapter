import { Button, Header, Progress } from "@beeline/design-system-react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchJSON } from "../../utils/index.mjs";
import { ExpandMore } from "@mui/icons-material";
import { PreviewAccordion } from "./preview-accordion.mjs";

const COMMENT_REGEX = /^(?<header>.*)\n(?<body>(\n*.*)*)$/m

/**
 * 
 * @param {{errorComment:{ level:"error"|"warning", summary:string, details:string}}} param0 
 */
function CommentCard({ errorComment }) {

    return <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}><Typography color={errorComment.level == "error" ? "red" : "blue"}>{errorComment.summary}</Typography></AccordionSummary>
        <AccordionDetails><Box component={Paper}><pre dangerouslySetInnerHTML={{ __html: errorComment.details }}></pre></Box></AccordionDetails>
    </Accordion>
}

function CommentCategories({ comments }) {

    const [toggled, setToggled] = useState(["error", "warning"]);


    const handleChangeToggled = (e, newMultiple) => {
        setToggled(newMultiple);
    };

    const categories = {};
    for (const c of comments) {
        const category = categories[c.category ?? "Другое"] ?? (categories[c.category ?? "Другое"] = []);
        category.push(c);
    }
    return <Box>
        <ToggleButtonGroup
            size="small"
            value={toggled}
            onChange={handleChangeToggled}
        >
            <ToggleButton value="error" size="small"><Typography color="red">Ошибки</Typography></ToggleButton>
            <ToggleButton value="warning" size="small"><Typography color="blue">Предупреждения</Typography></ToggleButton>
        </ToggleButtonGroup>
        {Object.entries(categories).map(([key, val]) => <Accordion key={key}>
            <AccordionSummary expandIcon={<ExpandMore />}><Typography fontWeight="fontWeightBold" color={val.find(c => c.level == "error") ? "red" : "blue"}>{key}</Typography></AccordionSummary>
            <AccordionDetails>
                {val.filter(c => toggled.find(v => v == c.level))
                    .sort((a, b) => a.level.localeCompare(b.level))
                    .map((c, i) => <CommentCard key={i} errorComment={c} />)}
            </AccordionDetails>
        </Accordion>)}
    </Box>
}

export function WorkspaceCheckResultPage() {
    const { workspaceid } = useParams();
    const { loading, data, error } = useFetchJSON(`/api/v4/structirizr/${workspaceid}/json-check`);

    const loadingBox = loading && <Box>
        <Header><Typography>Идет загрузка<Progress cycled={true} /></Typography>

        </Header>
    </Box>
    const errorBox = error && <Header><Typography color="red">Ошибка {JSON.stringify(error)}</Typography></Header>

    console.log(data);
    const dataBox = data && <Box>
        <Header>[{data.cmdb}] {data.name} </Header>

        <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>Ошибки и предупреждения</AccordionSummary>
            <AccordionDetails>
                <CommentCategories comments={data.comments} />
            </AccordionDetails>
        </Accordion>
        <PreviewAccordion preview={data.preview}/>
    </Box>;

    return <Box>
        {loadingBox}
        {dataBox}
        {errorBox}
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