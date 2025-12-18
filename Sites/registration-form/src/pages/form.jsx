import { useState } from "react";
import { EmailLabel, FileLabel, PhoneLabel, TextLabel } from "../fragments/label";
import styles from "./form.module.css"
import {data} from "../classes/data.js"
import { request } from "../api/regApi.js";

export default function Form() {
    //Для полей ввода
    const [name, setName] = useState("");
    const [secName, setSecName] = useState("");
    const [patr, setPatr] = useState("");
    const [email, setEmail] = useState("");
    const [number, setNumber] = useState("");
    const [agreement, setAgreement] = useState(false);
    const [file, setFile] = useState("");
    const [wish, setWish] = useState("");

    //Для вывода ошибок
    const [noName, setNoName] = useState(false);
    const [noSecName, setNoSecName] = useState(false);
    const [noPatr, setNoPatr] = useState(false);
    const [noEmail, setNoEmail] = useState(false);
    const [noData, setNoData] = useState(false);

    //Для связи с сервером
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);


    async function CheckAndSend() {
        setResponse("");
        setNoName(name.trim() == "");
        setNoSecName(secName.trim() == "");
        setNoPatr(patr.trim() == "");
        setNoEmail(email.trim() == "");
        setNoData(number == "" && !file)
            
        if (
            name.trim() == "" ||
            secName.trim() == "" ||
            patr.trim() == "" ||
            email.trim() == "" ||
            noData
        ) {
            return;
        }
            
        let reqst = new data();
        reqst.name = name.trim();
        reqst.second_name = secName.trim();
        reqst.patronim = patr.trim();
        reqst.email = email.trim();
        reqst.wish = wish.trim();
        reqst.number = number;
        reqst.file = file;

        setLoading(true);

        try {
            const resp = await request(reqst);
            console.log(resp)
            setResponse("Ожидайте QR-код на указанную электронную почту");
        } catch (e) {
            console.log(e);
            setResponse("Ошибка отправки запроса");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div>
            <h2>Регистрация на посещение аптекарского огорода</h2>
            <div className={styles.text}>Введите необходимые данные и ждите ответа на почту</div> <br/>
            <div className={styles.text}>Обязательно введите имя, фамилию, отчество, электронную почту и файл с документом, подтверждающим личность</div> <br/>

            <TextLabel plhld={"Имя*"} ident={"name"} value={name} onChange={e => setName(e.target.value)}/> <br/>
            {noName && <div className={styles.error}>Введите имя</div>}

            <TextLabel plhld={"Фамилия*"} ident={"second_name"} value={secName} onChange={e => setSecName(e.target.value)}/> <br/>
            {noSecName && <div className={styles.error}>Введите фамилию</div>}

            <TextLabel plhld={"Отчество*"} ident={"patronim"} value={patr} onChange={e => setPatr(e.target.value)}/> <br/>
            {noPatr && <div className={styles.error}>Введите отчество</div>}

            <EmailLabel plhld={"Электронная почта*"} ident={"email"} value={email} onChange={e => setEmail(e.target.value)}/> <br/>
            {noEmail && <div className={styles.error}>Введите почту</div>}

            <TextLabel plhld={"Предпочтения"} ident={"wish"} value={wish} onChange={e => setWish(e.target.value)}/> <br/>

            <PhoneLabel plhld={"Номер телефона"} ident={"number"} value={number} onChange={setNumber}/> <br/>
            <FileLabel plhld={""} ident={"file"} onChange={e => setFile(e.target.files?.[0])}/> <br/>
            {noData && <div className={styles.error}>Необходим либо номер телефона либо фото документа, подтверждающего личность</div>}

            <input type="checkbox" id="agreement" onChange={(e) => setAgreement(e.target.checked)} />
            <label htmlFor="agreement" className={styles.small_text}>Я даю согласие на обработку персональных данных.</label>

            <button className={styles.button} id="send_button" onClick={CheckAndSend} disabled={(loading || !agreement)}>
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
