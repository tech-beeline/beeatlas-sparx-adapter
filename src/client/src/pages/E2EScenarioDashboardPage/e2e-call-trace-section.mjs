import {
    AccountTree,
    Check,
    ExpandMore,
    KeyboardArrowDown,
    KeyboardArrowUp,
    Warning,
    WarningAmber,
    Menu as MenuIcon,
    Handyman,
} from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    Menu,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { styled } from "@mui/system";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import React, { useEffect, useState } from "react";
import { WebEANaviLine, formatWebEALink } from "../../utils/index.mjs";
import { Link } from "react-router-dom";
import { ERROR_INFO } from "./message-validate-errors.mjs";
import webeaLogo from "../../res/images/ea-icon.ico";


function MessageDetails({ messageDetails }) {
    const firstMethod = messageDetails.server_methods.find((t) => t);
    const { message } = messageDetails;

    return (
        <Box>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Сообщение</TableCell>
                        <TableCell>{messageDetails.message?.name}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Typography variant="h8">Методы</Typography>
            <Table component={Paper}>
                <TableHead>
                    <TableRow>
                        <TableCell>Метод</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {messageDetails.server_methods.map((m) => (
                        <TableRow>
                            <TableCell>
                                <Typography color="red">{m.name}</Typography>
                            </TableCell>
                            <TableCell>
                                <Button>Установить</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
}

function ErrorDetails({ call, error, setOpen }) {
    const [messageDetails, setMessageDetails] = useState(null);
    async function loadMessageDetails() {
        console.log("!");
        const response = await fetch(
            `/api/v3/e2e/messages/${encodeURIComponent(call.ea_guid)}`
        );
        if (response.status !== 200) {
            setMessageDetails({
                error: `HTTP STATUS: ${response.status} ( ${response.statusText})`,
                errorBody: await response.text(),
            });
            return;
        }
        setMessageDetails(await response.json());
    }
    useEffect(() => {
        loadMessageDetails();
    }, []);
    return (
        <Dialog open={true} onClose={() => setOpen(false)} maxWidth="true">
            <DialogTitle>Детальная информация о проблеме</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Общее описание проблемы:{" "}
                    {ERROR_INFO[error]?.summary ?? error}
                </DialogContentText>
                {messageDetails ? (
                    messageDetails.error ? (
                        `Ошибка при загрузке данных: ${messageDetails.error}`
                    ) : (
                        <MessageDetails messageDetails={messageDetails} />
                    )
                ) : (
                    "Данные загружаются"
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Закрыть</Button>
            </DialogActions>
        </Dialog>
    );
}

function Errors({ call }) {
    const { errors } = call ?? {};

    const [anchorMenu, setAnchorMenu] = useState(null);
    const [openDetails, setOpenDetails] = useState(false);

    const label = (error) => (
        <Box>
            <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={(e) => setAnchorMenu(e.currentTarget)}
            >
                <MenuIcon />
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorMenu}
                open={Boolean(anchorMenu)}
                sx={{ mt: "45px" }}
                onClose={() => setAnchorMenu(null)}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                {/*
        <MenuItem onClick={() => {
            setOpenDetails(true);
            setAnchorMenu(null);
        }}><Handyman />Детальная информация о проблеме</MenuItem>
        */}
                {openDetails ? (
                    <ErrorDetails
                        setOpen={setOpenDetails}
                        error={error}
                        call={call}
                    />
                ) : null}
                <MenuItem
                    component={Link}
                    to={formatWebEALink(call.d_uid)}
                    target="_blank"
                    onClick={() => setAnchorMenu(null)}
                >
                    <img src={webeaLogo} width="25" />{" "}
                    <Typography variant="h8">
                        Открыть диаграмму в WebEA
                    </Typography>{" "}
                </MenuItem>
            </Menu>
            {ERROR_INFO[error]?.summary ?? error}
        </Box>
    );
    return errors ? (
        <>
            {errors.map((e, i) => (
                <TreeItem
                    sx={{ color: "red" }}
                    label={label(e)}
                    nodeId={`${call.ea_guid}-err-${i}`}
                    key={`${call.ea_guid}-err-${i}`}
                ></TreeItem>
            ))}
        </>
    ) : null;
}

function CallItem({ call }) {
    const LabelIcon = call.errors ? (
        <Warning />
    ) : call.invalidChildren ? (
        <WarningAmber sx={{ color: "red" }} />
    ) : (
        <Check />
    );
    const CallTreeItem = call.errors || call.invalidChildren ?
        styled(TreeItem)({
            label: {
                color: "red",
            },
        }) :
        styled(TreeItem)({
            label: {
                color: "green",
            },
        });

    return call.errors ? (
        <CallTreeItem
            label={
                <div style={{ color: "red" }}>
                    {LabelIcon}
                    {`${call.client_code ?? call.client_name}->${call.server_code ?? call.server_name
                        } ${call.name}`}
                </div>
            }
            nodeId={call.ea_guid}
        >
            <Errors call={call} />
            {call.children?.map((c, i) => (
                <CallItem key={i} call={c} />
            ))}
        </CallTreeItem>
    ) : (
        <CallTreeItem
            label={
                <div style={{ color: "green" }}>
                    {LabelIcon}
                    {`${call.client_code ?? call.client_name}->${call.server_code ?? call.server_name
                        } ${call.name}`}
                </div>
            }
            nodeId={call.ea_guid}
        >
            {call.children?.map((c, i) => (
                <CallItem key={i} call={c} />
            ))}
        </CallTreeItem>
    );
}

export function CallTraceSection({ callTree }) {
    return (
        <Accordion component={Paper}>
            <AccordionSummary component={Paper} expandIcon={<ExpandMore />}>
                <AccountTree />
                <Box fontWeight="fontWeightMedium" display="inline">
                    Иерархия вызовов
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                {callTree.length > 0 ? <>
                    <Typography variant="h8" component={Paper}>
                        Легенда: <Warning sx={{ color: "red" }} /> - ошибка
                        заполнения взаимодействия,{" "}
                        <WarningAmber sx={{ color: "red" }} /> - Ошибка заполнения в
                        дочерних вызовах, <Check sx={{ color: "green" }} /> -
                        корректное заполнение
                    </Typography>
                    <Box component={Paper}>

                        <TreeView
                            defaultCollapseIcon={<KeyboardArrowUp />}
                            defaultExpandIcon={<KeyboardArrowDown />}
                        >
                            {(callTree[0].children?.length === 0 ? callTree : callTree[0].children).map((it, i) => (
                                <CallItem key={i} call={it} />
                            ))}
                        </TreeView>
                    </Box></> : <Typography variant="h5">Вызовы отсутствуют</Typography>}
            </AccordionDetails>
        </Accordion>
    );
}
