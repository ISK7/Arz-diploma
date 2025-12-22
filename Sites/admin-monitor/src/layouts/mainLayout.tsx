import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useRightsStore } from "../storage/rights.store"
import styles from "./mainLayout.module.css"
import { useEffect } from "react"
import { refreshToken } from "../api/api"

export default function MainLayout() {

    const isRedactor = useRightsStore((state) => state.keyAccess)
    const isAdmin = useRightsStore((state) => state.requestAccess)
    const navigate = useNavigate();

    async function handleLogOut() {
        try {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigate("/login");
        } catch (e) {
            console.error(`Ошибка при выходе из аккаунта: ${e}`);
        }
    }

    useEffect(() => {
        (async () => {
            try {
                let token = await refreshToken();
                localStorage.setItem("access_token", token);
            } catch (e) {
                navigate("/login");
                console.error(`Ошибка при обновлении токена: ${e}`);
            }
        })();
    }, []);

    return (
        <div className={styles.MainCont}>
            <div className={styles.Header}>
                {isRedactor && 
                <NavLink key="redactor" to="/redactor" className={styles.button}>Ключи</NavLink>}
                {isAdmin &&
                <NavLink key="admin" to="/admin" className={styles.button}>Заявки</NavLink>}
                <button onClick={handleLogOut} className={styles.button}>Выйти</button>
            </div>
            <div className={styles.Content}>
                <Outlet />
            </div>
        </div>
        )
}