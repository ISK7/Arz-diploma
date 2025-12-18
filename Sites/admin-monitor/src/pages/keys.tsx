import { useEffect, useState } from "react";
import type { key } from "../classes/key";
import { addKey, getFullKeys, deleteKey } from "../api/api";
import KeyLabel from "../components/keyLabel";

export default function Keys () {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [keys, setKeys] = useState<key[]>([]);
    const [newKey, setNewKey] = useState("");

    useEffect(() => {
        setLoading(true)
        getFullKeys().then((res) => {
            setKeys(res);
        }).catch(err => {
            setError(`error at load ${err}`);
            console.error("Ошибка загрузки:", err)
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    async function handleAddKey() {
        setLoading(true);
        setError(null);
        try {
            await addKey(newKey);
            const updatedKeys = await getFullKeys();
            setKeys(updatedKeys);
        } catch (e) {
            setError("Ошибка при добавлении ключа: " + e);
        } finally {
            setLoading(false);
            setNewKey("");
        }
    }

        async function handleDelete(ind: string) {
        setLoading(true);
        setError(null);
        try {
            await deleteKey(ind);
            const updatedKeys = await getFullKeys();
            setKeys(updatedKeys);
        } catch (e) {
            setError(`Ошибка при попытке удаления: ${e}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h2>Ключи</h2> <br/>
            {(loading) && <>Загрузка...</>}
            {error && <div>{error}</div>}
            {!loading && !error && 
                keys.map((keyObj) => ( <KeyLabel key={keyObj.key} keyVal={keyObj} handleDelete={handleDelete}/>
                ))}
            {!loading && !error && <input type="text" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Новый ключ"/>}
            {!loading && !error && <button onClick={handleAddKey}>Добавить ключ</button>}
        </div>
    );
}