import { VisitorLabel } from "../components/visitorLabel";
import { Checkbox } from "../components/checkbox";
import { getList } from "../api/api";
import { useEffect, useState } from "react";
import type { data } from "../classes/data";
import styles from "./monitor.module.css"

export default function Monitor() {
    const [loading, setLoading] = useState(true);
    const [visitors, setVisitors] = useState<data[]>();
    const [filtred, setFiltred] = useState<data[]>();
    const [search, setSearch] = useState("");
    const [showActual, setActual] = useState(true);
    const [showConfirmed, setConfirmed] = useState(false);
    const [showArchived, setArchived] = useState(false);
    const [showDeclined, setDeclined] = useState(false);
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

    useEffect(() => {
        let temporal: data[] = [];
        setFiltred(temporal);
        visitors?.filter(vis => (vis.id == parseInt(search) ||
                vis.name.includes(search) ||
                vis.second_name.includes(search) ||
                vis.patronim.includes(search) ||
                vis.email.includes(search)))
        .map(vis => {
            switch(vis.status) {
                case 0: if(showActual) temporal.push(vis); break;
                case -1: if(showDeclined) temporal.push(vis); break;
                case 1: if(showConfirmed) temporal.push(vis); break;
                case 2: if(showArchived) temporal.push(vis); break;
            }
        });
        setFiltred(temporal);
    }, [visitors, showActual, showArchived, showConfirmed, showDeclined, search])

    if(error) return <div className={styles.error}>
        {error}
    </div>
    return (
        <div className={styles.monitor}>
            <h2>Ожидающие разрешения</h2>
            <br/>
            {(loading) && <>Загрузка...</>}
            {!loading && <>
                <Checkbox ind="Actual" plhld="Ожидающие" value={showActual} onChange={setActual}/>
                <Checkbox ind="Confirmed" plhld="Подтверждённые" value={showConfirmed} onChange={setConfirmed}/>
                <Checkbox ind="Archived" plhld="Архивированные" value={showArchived} onChange={setArchived}/>
                <Checkbox ind="Declined" plhld="Отклонённые" value={showDeclined} onChange={setDeclined}/>
                <br/>
                <input type="text" placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)}/>
                <br/>
            </>}
            {!loading && filtred && filtred.length > 0 && filtred.map(vis => (
                <VisitorLabel visitor={vis} key={vis.id}></VisitorLabel>
            ))}
            {!loading && filtred && filtred.length == 0 && <>Данных нет</>}
        </div>
    );
}