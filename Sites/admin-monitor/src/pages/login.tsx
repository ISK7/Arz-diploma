import { useState } from "react";
import { logIn } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAccountStore } from "../storage/account.store";
import { useRightsStore } from "../storage/rights.store";
import styles from "./login.module.css";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string>(""); 
    const navigate = useNavigate();
    const setRights = useRightsStore((store) => store.setRights);
    const setGlobalLogin = useAccountStore((state) => state.setLogin);
    const setGlobalPassword = useAccountStore((state) => state.setPassword);

    async function logInFunc() {
        setLoading(true);
        try {
            const result = await logIn(login, password);
            navigate("/");
            setRights(result);
            setGlobalLogin(login);
            setGlobalPassword(password);

        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
            console.error(error);
            setLoading(false);
        }
    }

    return (
        <div>
            <input disabled={loading}  value={login} className={styles.input}
                    onChange={e => setLogin(e.target.value)}/><br/>
            <input disabled={loading} type="password" value={password} className={styles.input}
                    onChange={e => setPassword(e.target.value)} /><br/>
            <label>{error}</label><br/>
            <button disabled={loading} type="button" className={styles.button}
                    onClick={logInFunc}>Войти</button>
        </div>
    );
}