import { AppBar, Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Toolbar, Typography } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, Label, Title, Menu as MenuIcon, ExpandMore, SettingsApplications, Signpost } from "@mui/icons-material";
import { useState } from "react";
import { Link } from "react-router-dom";

export function MainBar({ contextMenu, title, barContent }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
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
                            {contextMenu ?
                                <>{contextMenu}
                                    <Divider />
                                </> : null}
                            <List>
                                <ListItem key="systems" disablePadding>
                                    <ListItemButton component={Link} to="/systems">
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
        </Box>)
}