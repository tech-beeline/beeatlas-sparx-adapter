import { KeyboardArrowDown, KeyboardArrowUp, Schema } from "@mui/icons-material";
import { Box, Collapse, IconButton, ListItemIcon, List, ListItem } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";

export function DiagramList({ diagrams }) {
    const [open, setOpen] = useState(false);

    return (
        diagrams?.length ? <Box>
            Участвует в {diagrams.length} сценариях : <IconButton size="small" onClick={() => setOpen(!open)} >{open ?
                <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>
            <Collapse in={open}>
                <List>{diagrams.map(d =>
                    <ListItem key={d.uid}>
                        <ListItemIcon><Schema /></ListItemIcon>
                        <Link href={`https://ms-seaapp001.bee.vimpelcom.ru:83?m=1&o=${d.uid}`} target="_blank" rel="noreferrer">{d.name}</Link>
                    </ListItem>)}
                </List>
            </Collapse>
        </Box> : <>Не участвует</>
    )
}