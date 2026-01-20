import { Link } from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import { tcService } from "../../resources/services/tc-service.mjs";
import { FDM_URL } from "../../resources/paths/index.mjs";

export function CapabilityBox({ capabilityCode }) {
    const [capability, setCapability] = useState(null);


    useEffect(() => {
        async function loadCapability() {
            try {
                if (!capabilityCode)
                    return;
                setCapability(await tcService.getByCode(capabilityCode));

            } catch (error) {
                console.error(error);
            }
        }

        loadCapability();
    }, [capabilityCode]);

    return (
        <Link href={`${FDM_URL}/models/search?request=${encodeURIComponent(capabilityCode)}`} target="_blank">{capability ? capability.name : capabilityCode}
        </Link>)
}