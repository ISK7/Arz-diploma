import type { data } from "../classes/data"
import { accept, getFile, refuse } from "../api/api";
import { useEffect, useState } from "react";
// import styles from "./visitorLabel.model.css"

export const VisitorLabel = ({visitor}: {visitor: data}) => {
    const [loading, setLoading] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<string | null>(null);

    async function handleAccept() {
        setLoading(true);
        setError(null);
        try {
            await accept(visitor.id);
            setHidden(true);
        } catch (e) {
            setError("Ошибка при подтверждении: " + e);
        } finally {
            setLoading(false);
        }
    }

    async function handleRefuse() {
        setLoading(true);
        setError(null);
        try {
            await refuse(visitor.id);
            setHidden(true);
        } catch (e) {
            setError("Ошибка при отказе: " + e);
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

    return (
        <div className="visitor_label">
            {!hidden &&
            <div>
                <div className="text">
                    {visitor.name} {visitor.second_name} {visitor.patronim} {visitor.email}
                </div><br/>
                {visitor.number &&
                <div className="text">
                    {visitor.number}
                    <br/>
                </div>}
                {visitor.image && image &&
                <div><img className="img" alt="Что-то пошло не так" src={image}></img></div>}

                {error && <div className="error">{error}</div>}

                <button disabled={loading} onClick={handleAccept}>
                    Разрешить
                </button>
                <button disabled={loading} onClick={handleRefuse}>
                    Отклонить
                </button>

                {loading && <div className="loading">Отправка...</div>}
                <hr></hr>
            </div>
            }
        </div>
    );
};
