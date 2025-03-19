import { useEffect, useState } from "react";

const DEFAULT_OPTIONS = {
    headers: { "Content-Type": "application/json" },
};

/**
 * 
 * @param {*} url 
 * @param {*} options 
 * @param {[]} dependencies 
 * @returns 
 */
export function useFetchJSON(url, options, dependencies) {
    //dependencies = dependencies ?? [];
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {

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

        fetchData();
    }, dependencies);

    return { loading: loading, data: data, error: error }
}

