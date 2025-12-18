import type { data } from "../classes/data"
import { getFile } from "../api/api";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./visitorLabel.module.css"

export const VisitorLabel = ({visitor}: {visitor: data}) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<string | null>(null);
    
    const navigate = useNavigate();

    async function handleRedact() {
        setLoading(true);
        setError(null);
        try {
            navigate(`/admin/${visitor.id}`, { state: { item: visitor, img: image } });
        } catch (e) {
            setError(`Ошибка при попытке вызова редактора: ${e}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setImage(null);
        let objectUrl: string;
        let cancelled = false;
        (async () => {
            try {
                if (!visitor.image) return;
                if (!cancelled) {
                    objectUrl = await getFile(visitor.image);
                    setImage(objectUrl);
                    console.log(objectUrl);
                }
            } catch {
                setError("Ошибка при загрузке файла");
            }
        })();

        return () => {
            cancelled = true;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [visitor.image]);

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
                {visitor.name} {visitor.second_name} {visitor.patronim} {visitor.email}
            </div><br/>
            {visitor.number &&
            <div className={styles.text}> {visitor.number}<br/> </div>}
            {visitor.image && image &&
            <div><img className={styles.img} alt="Что-то пошло не так" src={image}></img></div>}
            {visitor.wish &&
            <div className={styles.text}> {visitor.wish}<br/> </div>}

            <div className={styles.text}> {status}<br/> </div>

            {error && <div className={styles.error}>{error}</div>}

            <button disabled={loading} onClick={handleRedact}>
                Редактировать
             </button>
            <hr></hr>
        </div>
    );
};
