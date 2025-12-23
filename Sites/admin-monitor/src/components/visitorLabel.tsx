import type { data } from "../classes/data"
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./visitorLabel.module.css"

export const VisitorLabel = ({visitor}: {visitor: data}) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState<string | null>(null);
    
    const navigate = useNavigate();

    async function handleRedact() {
        setLoading(true);
        setError(null);
        try {
            navigate(`/admin/${visitor.id}`, { state: { item: visitor } });
        } catch (e) {
            setError(`Ошибка при попытке вызова редактора: ${e}`);
        } finally {
            setLoading(false);
        }
    }

    

    useEffect(() => {
        switch(visitor.status) {
            case 0: setStatus("Ожидает"); break;
            case -1: setStatus("Отклонена"); break;
            case 1: setStatus("Подтверждена"); break;
            case 2: setStatus("Архивирована"); break;
        }
    }, [visitor.status])

    return (
        <div className={styles.visitor_label}>
            <div className={styles.text}>
                {visitor.name} {visitor.second_name} {visitor.patronim} <br/> {visitor.email} 
            </div>
            {visitor.number && visitor.number != "undefined" &&
            <div className={styles.text}> {visitor.number}<br/> </div>}
            {visitor.wish &&
            <div className={styles.text}> {visitor.wish}<br/> </div>}

            <div className={styles.text}> {status}<br/> </div>

            {error && <div className={styles.error}>{error}</div>}

            <button disabled={loading} className={styles.button} onClick={handleRedact}>
                Редактировать
             </button>
        </div>
    );
};
