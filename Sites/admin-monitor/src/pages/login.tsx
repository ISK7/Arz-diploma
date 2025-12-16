import { useState } from "react";
import { logIn } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string>(""); 
    const navigate = useNavigate();

    async function login() {
        setLoading(true);
        try {
            const result = await logIn(password);

            if (result == "OK") {
                navigate("/admin");
            } else {
                setError(result);
                setLoading(false);
            }

        } catch {
            setLoading(false);
        }
    }

    return (
        <div>
            <input disabled={loading} type="password" value={password}
                   onChange={e => setPassword(e.target.value)} />
            <label>{error}</label><br/>
            <button type="button" onClick={login}>Войти</button>
        </div>
    );
}