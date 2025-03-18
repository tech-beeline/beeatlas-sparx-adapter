import { Button, Header, Progress } from "@beeline/design-system-react";
import { Box, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchJSON } from "../../utils/index.mjs";

export function WorkspaceCheckResultPage() {
    const { workspaceid } = useParams();
    const { loading, data, error } = useFetchJSON(`/api/v4/structirizr/${workspaceid}/json-check`);

    const loadingBox = loading && <Box>
        <Header><Typography>Идет загрузка</Typography>
            <Progress cycled={true} />
        </Header>
    </Box>
    const errorBox = error && <Box><Typography color="red">Ошибка ${error}</Typography></Box>

    const dataBox = data && <Box><Header>[{data.cmdb}] {data.name} </Header></Box>;

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