import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select'
import { accept, getKeys, refuse, close, getFile, checkRights } from '../api/api';
import styles from "./redactor.module.css"
import type { data } from '../classes/data';

export default function VisitorRedactor() {
    const location = useLocation();
    const visitor:data = location.state?.item;

    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    const [status, setStatus] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [date, setDate] = useState("");
    const [key, setKey] = useState("");
    const [option, setOption] = useState<{value: string, label: string} | null>(null);
    const [options, setOptions] = useState<{value: string, label: string}[]>();

    const navigate = useNavigate();

    async function handleAccept() {
        setLoading(true);
        setError(null);
        if (!ready) {
            setError("Ты как эту функцию вызвал? Заполни все поля!");    
            return;
        }
        try {
            await accept(visitor.id, key, date);
            setStatus("Подтверждена");
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
            setStatus("Отклонена");
        } catch (e) {
            setError("Ошибка при отказе: " + e);
        } finally {
            setLoading(false);
        }
    }

    async function handleClose() {
        setLoading(true);
        setError(null);
        try {
            await close(visitor.id);
            setStatus("Архивирована");
        } catch (e) {
            setError("Ошибка при закрытии: " + e);
        } finally {
            setLoading(false);
        }
    }

    async function handleExit() {
        setLoading(true);
        setError(null);
        try {
            navigate(`/admin`);
        } catch (e) {
            setError(`Ошибка при попытке выходе из редактора: ${e}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        (async () => {let acess = await checkRights();
            if(!acess) return(<div className={styles.text}>You do not have acess to this page</div>)
        });
        if(visitor.date)
            setDate(visitor.date);

        (async () => {
                try {
                    const ans = await getKeys();
                    setOptions(ans?.map(a => ({value: a, label: a})));
                } catch (e) {
                    setError("Ошибка при загрузке ключей " + e);
                }})();
    }, []);

    useEffect(() => {
        setKey(option ? option.value : "");
    }, [option]);

    useEffect(() => {
        switch(visitor.status) {
            case 0: setStatus("Ожидает"); break;
            case -1: setStatus("Отклонена"); break;
            case 1: setStatus("Подтверждена"); break;
            case 2: setStatus("Архивирована"); break;
        }
    }, [visitor.status]);

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
        if(!key || ! date) {setReady(false); return;}
        if(key == "" || date == "") {setReady(false); return;}
        setReady(true);
    }, [key, date]);

    return (
        <div>
            <div className={styles.text}>
                <div className={styles.border}>
                    {visitor.name} {visitor.second_name} {visitor.patronim}
                    <br/>
                    {visitor.email}
                    <br/>
                    {visitor.number &&
                    <div className={styles.text}> {visitor.number}<br/> </div>}
                </div>
                <div className={styles.border}>
                    Предпочтения визита:
                    <br/>
                    {visitor.wish}
                    <br/>
                </div>
            </div>
            
            {visitor.image && image &&
            <div><img className={styles.img} alt="Что-то пошло не так" src={image}></img></div>}
            <div className={styles.text}> {status}<br/> </div>

            <input type="date" placeholder="Дата" value={date} className={styles.input}
                onChange={e => setDate(e.target.value)}/>
            <Select value={option} onChange={e => {if(e) setOption(e)}}
                className={styles.select} options={options} placeholder="Ключи"/>

            {error && <div className={styles.error}>{error}</div>}

            <button disabled={loading || !ready} onClick={handleAccept} className={styles.button}>
                Подтвердить
            </button>
            <button disabled={loading} onClick={handleRefuse} className={styles.button}>
                Отказать
            </button>
            <button disabled={loading} onClick={handleClose} className={styles.button}>
                Закрыть заявку
            </button> <br/>
            <button disabled={loading} onClick={handleExit} className={styles.button}>
                Выйти из редактора
            </button>

        </div>
    );
}