import {
    Box,
    Typography
} from "@mui/material";
import { UserSelect } from "./components/UserSelect.mjs";
import { useNavigate, useParams } from "react-router-dom";
import { UserActions } from "./components/UserActions.mjs";

export function DigitalArchitectActionsPage() {
    const params = useParams();
    const navigate = useNavigate();

    const setLogin = (newLogin) => {
        if (newLogin !== params.login) {
            navigate(`/digital-architect/${encodeURIComponent(newLogin)}/actions`);
        }
    }

    return <Box>
        <Typography variant="h4">{params.login?`Статитика для пользователя ${params.login}`:"Выбирете пользователя для просмотра статистики"}</Typography>
        <UserSelect setLogin={setLogin} login={params.login}/>
        <UserActions login={params.login} />
    </Box>
}