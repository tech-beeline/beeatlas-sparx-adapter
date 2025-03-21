import { Typography } from "@beeline/design-system-react";
import { ArrowRight } from "@mui/icons-material";
import { Box } from "@mui/material";

export function SequencePage() {
    const poolw = 150
    return <>
        <Box>
            <Box sx={{ display: "inline-block", border: 1, height: 1000, width: poolw }}><Typography variant="body3" >WWWBEELINERU</Typography></Box>
            <Box sx={{ display: "inline-block", border: 1, height: 1000, width: poolw }}><Typography variant="body3" >USSS</Typography></Box>
            <Box sx={{ display: "inline-block", border: 1, height: 1000, width: poolw }}><Typography variant="body3" >IAPI</Typography></Box>
            <Box sx={{ position: "absolute", backgroundColor: "gray", height: 30, width: poolw * 2 - 20, left: 10, top: 50 }}><Typography align="right"> GET /1.0/info/payType<ArrowRight/></Typography></Box>
            <Box sx={{ position: "absolute", backgroundColor: "gray", height: 30, width: 180, left: 110, top: 80 }}><Typography variant="h5">Method asda asd</Typography></Box>
        </Box>
    </>
}