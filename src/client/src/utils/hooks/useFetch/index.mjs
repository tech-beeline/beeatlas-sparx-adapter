import { useEffect, useState } from "react";

const DEFAULT_OPTIONS = {
    headers: { "Content-Type": "application/json" },
};

export function useFetchJSON(url, options, dependencies = []) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(url, { ...DEFAULT_OPTIONS, ...options });
            if (res.ok) {
                setData(await res.json());
                return;
            }
            setError(await res.json());
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, dependencies);

    return { loading: loading, data: data, error: error }
}

