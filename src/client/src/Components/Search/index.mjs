import React, { useRef } from "react";
import { TextField } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

import styles from "./Search.module.css";

// const Search = styled("div")(({ theme }) => ({
//     position: "relative",
//     borderRadius: theme.shape.borderRadius,
//     // backgroundColor: alpha(theme.palette.common.white, 0.15),
//     "&:hover": {
//         // backgroundColor: alpha(theme.palette.common.white, 0.25),
//     },
//     color: "rgba(0, 0, 0, 0.87)",
//     marginLeft: 0,
//     width: "100%",
//     [theme.breakpoints.up("sm")]: {
//         marginLeft: theme.spacing(1),
//         width: "auto",
//     },
// }));

// const SearchIconWrapper = styled("div")(({ theme }) => ({
//     padding: theme.spacing(0, 2),
//     height: "100%",
//     position: "absolute",
//     pointerEvents: "none",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
// }));

// const StyledInputBase = styled(InputBase)(({ theme }) => ({
//     color: "inherit",
//     width: "100%",
//     "& .MuiInputBase-input": {
//         padding: theme.spacing(1, 1, 1, 0),
//         // vertical padding + font size from searchIcon
//         paddingLeft: `calc(1em + ${theme.spacing(4)})`,
//         transition: theme.transitions.create("width"),
//         [theme.breakpoints.up("sm")]: {
//             width: "12ch",
//             "&:focus": {
//                 width: "20ch",
//             },
//         },
//     },
// }));

// const TextFieldStyled = styled(TextField)(({ theme }) => ({
//     marginLeft: theme.spacing(1),
// }));

export function SearchBox({ setSearchText }) {
    const inputRef = useRef("");

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setSearchText?.(inputRef.current.value);
        }
    };

    return (
        <TextField
            placeholder="Search..."
            className={styles.input}
            inputRef={inputRef}
            onKeyDown={handleKeyDown}
            size="small"
            variant="outlined"
            inputProps={{ "aria-label": "search" }}
            InputProps={{ startAdornment: <SearchIcon /> }}
        />
        // <Search>
        //     <SearchIconWrapper>
        //         <SearchIcon />
        //     </SearchIconWrapper>
        //     <StyledInputBase
        //         placeholder="Search…"
        //         inputProps={{ "aria-label": "search" }}
        //         inputRef={valueRef}
        //         onKeyDown={handleKeyDown}
        //     />
        // </Search>
    );
}
