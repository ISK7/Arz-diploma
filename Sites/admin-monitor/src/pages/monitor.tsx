import { VisitorLabel } from "../components/visitorLabel";
import { getList } from "../api/api";
import { useEffect, useState } from "react";
import type { data } from "../classes/data";
import styles from "./monitor.module.css"

export default function Monitor() {
    const [loading, setLoading] = useState(true);
    const [visitors, setVisitors] = useState<data[]>();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true)
        getList().then((res) => {
            console.log(res);
            setVisitors(res);
        }).catch(err => {
            setError(`error at load ${err}`);
            console.error("Ошибка загрузки:", err)
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    if(error) return <div className={styles.error}>
        {error}
    </div>
    return (
        <div className={styles.monitor}>
            <h2>Ожидающие разрешения</h2>
            <br/>
            {(loading || !visitors) && <>Загрузка...</>}
            {!loading && visitors && visitors.length > 0 && visitors.map(vis => (
                <VisitorLabel visitor={vis}></VisitorLabel>
            ))}
            {!loading && visitors && visitors.length == 0 && <>Ожидающих нет</>}
        </div>
    );
}