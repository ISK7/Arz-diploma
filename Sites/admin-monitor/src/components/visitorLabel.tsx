import type { data } from "../classes/data"
import { accept, refuse } from "../api/api";
import { useState } from "react";

export const VisitorLabel = ({visitor}: {visitor: data}) => {
    const [loading, setLoading] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (hidden) return null;

    async function handleAccept() {
        setLoading(true);
        setError(null);
        try {
            await accept(visitor.id);
            setHidden(true);
        } catch (e) {
            setError("Ошибка при подтверждении");
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
            setError("Ошибка при отказе");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="visitor_label">
            <div className="text">
                {visitor.name} {visitor.second_name} {visitor.patronim} {visitor.phone}
            </div>

            {error && <div className="error">{error}</div>}

            <button disabled={loading} onClick={handleAccept}>
                Разрешить
            </button>
            <button disabled={loading} onClick={handleRefuse}>
                Отклонить
            </button>

            {loading && <div className="loading">Отправка...</div>}
        </div>
    );
};
