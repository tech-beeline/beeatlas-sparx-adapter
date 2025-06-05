import { Progress } from "@beeline/design-system-react";
import { Launch } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * 
 * @param {{systemCode:string}} props 
 * @returns 
 */
export function SystemLink({ systemCode }) {
    const [system, setSystem] = useState();
    const [loading, setLoading] = useState();

    useEffect(() => {
        const loadSystem = async (code) => {
            try {
                setLoading(true);
                const response = await fetch(`/api/v4/systems/${encodeURIComponent(code)}`);
                if (response.status === 200) {
                    setSystem(await response.json());
                }
            } catch (error) {
            } finally {
                setLoading(null);
            }
        }
        loadSystem(systemCode);
    }, []);

    return <Link to={`/systems/${encodeURIComponent(systemCode?.toLowerCase())}`} target="_blank"><Typography><Launch/>{system?.name ?? systemCode}</Typography></Link>
}