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
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export function HomeLink() {
    return (
        <NavLink
            underline="hover"
            sx={{ display: "flex", alignItems: "center" }}
            className="link"
            to="/"
        >
            <div style={{ display: "flex", alignItems: "center" }}>
                <Home />
                Архитектура
            </div>
        </NavLink>
    );
}

export function SystemCatalogLink() {
    return (
        <NavLink underline="hover" className="link" to="/systems">
            <div style={{ display: "flex", alignItems: "center" }}>
                <SettingsApplications />
                Каталог систем
            </div>
        </NavLink>
    );
}

export function E2ECatalogLink() {
    return (
        <NavLink underline="hover" className="link" to="/e2e">
            <div style={{ display: "flex", alignItems: "center" }}>
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
            <div style={{ display: "flex", alignItems: "center" }}>
                <Signpost />
                {title}
            </div>
        </NavLink>
    );
}

export function MainBar({ contextMenu, title, barContent }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <Box
            sx={{
                flexGrow: 1,
                borderBottom: "1px solid #191c341f",
            }}
        >
            <AppBar
                position="static"
                sx={{ backgroundColor: "#fff", color: "rgba(0, 0, 0, 0.87)" }}
            >
                <Toolbar>
                    <div>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={() => setMenuOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                    </div>
                    <Typography variant="h6">{title}</Typography>
                    {barContent}
                    <Drawer open={menuOpen} onClose={() => setMenuOpen(false)}>
                        <Box sx={{ width: 300 }} role="presentation">
                            {contextMenu ? (
                                <>
                                    {contextMenu}
                                    <Divider />
                                </>
                            ) : null}
                            <List>
                                <ListItem key="systems" disablePadding>
                                    <ListItemButton
                                        component={Link}
                                        to="/systems"
                                    >
                                        <ListItemIcon>
                                            <SettingsApplications />
                                        </ListItemIcon>
                                        <ListItemText primary="Каталог систем" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem key="e2e" disablePadding>
                                    <ListItemButton component={Link} to="/e2e">
                                        <ListItemIcon>
                                            <Signpost />
                                        </ListItemIcon>
                                        <ListItemText primary="Каталог E2E процессов" />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Box>
                    </Drawer>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
