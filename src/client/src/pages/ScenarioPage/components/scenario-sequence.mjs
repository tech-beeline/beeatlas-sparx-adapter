import { Tree, TreeNode } from "@beeline/design-system-react";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { ScenarioMessage } from "../../../model/scenario/scenario-message-dto.mjs";
import { distinctMessages } from "../utils.mjs";

/**
 * 
 * @param {{message:ScenarioMessage}} param0 
 * @returns 
 */
function ScenarioMessageItem({ message }) {
    const sequence = message.sequence && distinctMessages(message.sequence);
    console.log(message);
    return (
        <TreeNode id={message.uid} title={message.title} >
            {sequence && sequence.map(m => <ScenarioMessageItem key={m.uid} message={m} />)}
        </TreeNode>
    )
}

export function ScenarioSequence({ sequence }) {
    return sequence && (
        <Box>
            <Tree onChange={() => { }}
                title="Последовательность вызовов">
                {sequence.map(m => <ScenarioMessageItem key={m.uid} message={m} />)}
            </Tree>
        </Box>
    )
}