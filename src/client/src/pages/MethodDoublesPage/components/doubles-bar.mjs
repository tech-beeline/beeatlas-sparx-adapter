import { Button, IconButton, TextField } from "@mui/material";
import { MainBar, SearchBox } from "../../../components/index.mjs";
import { Search as SearchIcon } from "@mui/icons-material";
import { useState } from "react";

export function MethodsDoublesAppBar({ setFilter }) {
    const [api, setApi] = useState();
    const [method, setMethod] = useState();


    const renderBar = <>
        <TextField label="Интерфейсы"
            onChange={(e) => setApi(e.target.value)}
        />
        <TextField label="Методы"
            onChange={(e) => setMethod(e.target.value)}
        />
        <Button onClick={() => setFilter?.({ apiFilter: api, methodFilter: method })}><SearchIcon />Применить фильтр</Button>
    </>
    return <MainBar barContent={renderBar}></MainBar>
}