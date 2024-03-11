import { NavLink } from "react-router-dom";
import React, { useEffect, useState } from 'react';



function E2EFillingStatus() {
    const [e2eStatus, setE2eStatus] = useState({});


    return (
        <div className="E2EFillingStatus">
            <div>Идет загрузка данных</div>
        </div>
    );
}

export default E2EFillingStatus;
