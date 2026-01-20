import { useRef } from "react";
import { TextField } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

import styles from "./Search.module.css";


export function SearchBox({ setSearchText, label }) {
    const inputRef = useRef("");

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setSearchText?.(inputRef.current.value);
        }
    };

    return (
        <TextField
            placeholder="Search..."
            label={label}
            className={styles.input}
            inputRef={inputRef}
            onKeyDown={handleKeyDown}
            size="small"
            variant="outlined"
            inputProps={{ "aria-label": "search" }}
            InputProps={{ startAdornment: <SearchIcon /> }}
        />
    );
}
