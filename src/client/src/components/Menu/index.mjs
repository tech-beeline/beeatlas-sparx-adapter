import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
    AppBar,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";
import {
    Menu as MenuIcon,
    SettingsApplications,
    Signpost,
    Home,
} from "@mui/icons-material";

import styles from "./Menu.module.css";

export function HomeLink() {
    return (
        <NavLink underline="hover" className="link" to="/">
            <div className={styles.linkContainer}>
                <Home />
                Архитектура
            </div>
        </NavLink>
    );
}

export function SystemCatalogLink() {
    return (
        <NavLink underline="hover" className="link" to="/systems">
            <div className={styles.linkContainer}>
                <SettingsApplications />
                Каталог систем
            </div>
        </NavLink>
    );
}

export function E2ECatalogLink() {
    return (
        <NavLink underline="hover" className="link" to="/e2e">
            <div className={styles.linkContainer}>
                <Signpost />
                Каталог E2E процессов
            </div>
        </NavLink>
    );
}

export function E2EProcessLink({ title, uid }) {
    return (
        <NavLink
            underline="hover"
            className="link"
            color="inherit"
            to={`/e2e/${encodeURIComponent(uid)}`}
        >
            <div className={styles.linkContainer}>
                <Signpost />
                {title}
            </div>
        </NavLink>
    );
}

export function MainBar({ contextMenu, title, barContent }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <Box className={styles.container}>
            <AppBar position="static" elevation={0} className={styles.appBar}>
                <Toolbar>
                    <div>
                        {contextMenu ? <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={() => setMenuOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton> : null}
                    </div>
                    <Typography variant="h6">{title}</Typography>
                    {barContent}
                    {contextMenu ? <Drawer open={menuOpen} onClose={() => setMenuOpen(false)}>
                        <Box sx={{ width: 300 }} role="presentation">
                            {contextMenu}
                        </Box>
                    </Drawer> : null}
                </Toolbar>
            </AppBar>
        </Box>
    );
}
