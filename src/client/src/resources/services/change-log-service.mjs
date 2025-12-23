
/**
 * 
 * @param { string} code 
 */
export async function loadChangeLog(code, { setError, setData, setLoading } = {}) {
    try {
        if( !code)
            throw Error('code is not specified');
        console.log(code);
        if (setLoading) setLoading(true);
        const result = await fetch(`/api/v4/systems/${code}/changes`);
        if (!result.ok)
            throw Error(`${result.status}: ${await result.text()}`);

        const data = await result.json();
        if (setData) setData(data);
        return data;
    } catch (error) {
        if (setError)
            setError(`Ошибка истоории изменений: ${error.message}`);
        else throw Error(`Ошибка при загрузке данных: ${error.message}`, { cause: error });
    } finally {
        if (setLoading) setLoading(null);
    }
}