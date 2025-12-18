import { useState } from "react";
import { logIn } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const ADMINLOGINS = ["admin", "redactor"];
    const [loading, setLoading] = useState(false);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string>(""); 
    const navigate = useNavigate();

    async function logInFunc() {
        setLoading(true);
        try {
            const result = await logIn(login, password);

            if (result == "OK") {
                if (login == ADMINLOGINS[0])
                    navigate("/admin");
                else if (login == ADMINLOGINS[1])
                    navigate("/redactor");
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
            <input disabled={loading}  value={login}
                    onChange={e => setLogin(e.target.value)}/><br/>
            <input disabled={loading} type="password" value={password}
                    onChange={e => setPassword(e.target.value)} /><br/>
            <label>{error}</label><br/>
            <button type="button" onClick={logInFunc}>Войти</button>
        </div>
    );
}