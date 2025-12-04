import { PhoneLabel, TextLabel } from "../fragments/label";
import styles from "./form.module.css"
import {data} from "../classes/data.js"
import { request } from "../api/regApi.js";

export default function Form() {
    let noName = false;
    let noSecName = false;
    let noPatr = false;
    let noNumb = false;
    let response = null;

    function CheckAndSend(name, secName, patr, numb) {
        if (name == null) return;
        name = name.value;
        secName = secName.value;
        patr = patr.value;
        numb = numb.value;
        if (name == "") noName = true
        else noName = false;
        if (secName == "") noSecName = true
        else noSecName = false;
        if (patr == "") noPatr = true
        else noPatr = false
        if (numb == "") noNumb = true
        else noNumb = false;
            
        if (noName || noSecName || noPatr || noNumb) return;
            
        let reqst = new data();
        reqst.name = name;
        reqst.second_name = secName;
        reqst.patronim = patr;
        reqst.phone = numb;

        response = request(reqst);
    }


    return (
        <div>
            <h2>Регистрация на посещение аптекарского огорода</h2>
            <div className={styles.text}>Введите необходимые данные и ждите ответа от Telegram-бота</div> <br/>
            <TextLabel plhld={"Имя"} ident={"name"}/> <br/>
            <div>{noName? (<div className={styles.error}>Введите имя</div>):(<></>)}</div>
            <TextLabel plhld={"Фамилия"} ident={"second_name"}/> <br/>
            <div>{noSecName? (<div className={styles.error}>Введите фамилию</div>):(<></>)}</div>
            <TextLabel plhld={"Отчество"} ident={"patronim"}/> <br/>
            <div>{noPatr? (<div className={styles.error}>Введите отчество</div>):(<></>)}</div>
            <PhoneLabel num={""} plhld={"Номер телефона"} ident={"number"}/> <br/>
            <div>{noNumb? (<div className={styles.error}>Введите номер</div>):(<></>)}</div>
            <button className={styles.button} id="send_button" onClick={() =>
                CheckAndSend(document.getElementById("name"),
                document.getElementById("second_name"),
                document.getElementById("patronim"),
                document.getElementById("number"))
                }>Отправить данные</button>
        </div>
    );
}
