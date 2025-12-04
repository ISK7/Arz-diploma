import PhoneInput from "react-phone-number-input/input"
import styles from "./label.module.css"
import { useState } from "react";

export const TextLabel = ({plhld, ident}) => {
    let [inputValue, setInputValue] = useState('Initial Value');
    return (
    <input
      type="text"
      id={ident}
      placeholder={plhld}
      className={styles.label}
      onChange={() => {}}
    />
  );
}

export const PhoneLabel = ({num, plhld, ident}) => {
    return (
    <PhoneInput
      defaultCountry="RU"
      id={ident}
      placeholder={plhld}
      defaultValue={num}
      className={styles.label}
      onChange={() => {}}
    />
  );
}
