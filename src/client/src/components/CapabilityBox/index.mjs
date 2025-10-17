import { Link } from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import { tcService } from "../../resources/services/tc-service.mjs";

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
        <Link href={`https://beeatlas.vimpelcom.ru/models/search?request=${encodeURIComponent(capabilityCode)}`} target="_blank">{capability ? capability.name : capabilityCode}
        </Link>)
}