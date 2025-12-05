import { useState } from "react";
import { PhoneLabel, TextLabel } from "../fragments/label";
import styles from "./form.module.css"
import {data} from "../classes/data.js"
import { request } from "../api/regApi.js";

export default function Form() {
    //Для полей ввода
    const [name, setName] = useState("");
    const [secName, setSecName] = useState("");
    const [patr, setPatr] = useState("");
    const [numb, setNumb] = useState("");

    //Для вывода ошибок
    const [noName, setNoName] = useState(false);
    const [noSecName, setNoSecName] = useState(false);
    const [noPatr, setNoPatr] = useState(false);
    const [noNumb, setNoNumb] = useState(false);

    //Для связи с сервером
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);


    async function CheckAndSend() {
        setResponse("");
        setNoName(name.trim() == "");
        setNoSecName(secName.trim() == "");
        setNoPatr(patr.trim() == "");
        setNoNumb(numb == "");
            
        if (
            name.trim() == "" ||
            secName.trim() == "" ||
            patr.trim() == "" ||
            numb == ""
        ) {
            return;
        }
            
        let reqst = new data();
        reqst.name = name.trim();
        reqst.second_name = secName.trim();
        reqst.patronim = patr.trim();
        reqst.phone = numb;

        setLoading(true);

        try {
            const resp = await request(reqst);
            console.log(resp)
            setResponse("Ожидайте сообщение от нашего телеграмм-бота");
        } catch (e) {
            setResponse("Ошибка отправки запроса");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div>
            <h2>Регистрация на посещение аптекарского огорода</h2>
            <div className={styles.text}>Введите необходимые данные и ждите ответа от Telegram-бота</div> <br/>

            <TextLabel plhld={"Имя"} ident={"name"} value={name} onChange={e => setName(e.target.value)}/> <br/>
            {noName && <div className={styles.error}>Введите имя</div>}

            <TextLabel plhld={"Фамилия"} ident={"second_name"} value={secName} onChange={e => setSecName(e.target.value)}/> <br/>
            {noSecName && <div className={styles.error}>Введите фамилию</div>}

            <TextLabel plhld={"Отчество"} ident={"patronim"} value={patr} onChange={e => setPatr(e.target.value)}/> <br/>
            {noPatr && <div className={styles.error}>Введите отчество</div>}

            <PhoneLabel plhld={"Номер телефона"} ident={"number"} value={numb} onChange={e => setNumb(e.value)}/> <br/>
            {noNumb && <div className={styles.error}>Введите номер</div>}

            <button className={styles.button} id="send_button" onClick={CheckAndSend} disabled={loading}>
                {loading ? "Отправка..." : "Отправить данные"}
            </button>
            {response && (
                <div className={styles.text}>
                    <br/>Ответ сервера: {response}
                </div>
            )}
        </div>
    );
}
