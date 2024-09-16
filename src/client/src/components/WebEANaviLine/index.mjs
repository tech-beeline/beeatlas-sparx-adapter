import React from "react";
import { formatWebEALink } from "../../utils/index.mjs";

export function WebEANaviLine({ uid, text }) {
    return (
        <a href={formatWebEALink(uid)} target="_blank" rel="noreferrer">
            {text ?? "Посмотреть в WebEA"}
        </a>
    );
}
