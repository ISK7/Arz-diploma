import type { key } from "../classes/key";
import styles from "./keyLabel.module.css";

export default function KeyLabel ({keyVal, handleDelete}: {keyVal: key, handleDelete: (id: string) => void}) {

    return (
        <div>
            <p>Ключ: {keyVal.key}</p>
            <p>Свободность: {keyVal.isFree.toString()}</p>
            <button className={styles.button} onClick={() => handleDelete(keyVal.key)}>
                Удалить ключ
            </button>
            <hr></hr>
        </div>
    );
}
