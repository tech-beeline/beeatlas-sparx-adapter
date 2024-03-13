import { NavLink } from "react-router-dom";
import React, { useEffect, useState } from 'react';



function E2EFillingStatus() {
    const [e2eStatus, setE2eStatus] = useState([]);
    const update = async () => {
        setE2eStatus([1, 2, 3]);
        console.log('!!!!');
    }

    useEffect(() => {
        update();
    }, [])


    return (
        <div className="E2EFillingStatus">
            data count = {e2eStatus.length}
        </div>
    );
}

export default E2EFillingStatus;
