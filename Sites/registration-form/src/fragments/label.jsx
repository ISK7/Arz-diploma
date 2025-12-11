import PhoneInput from "react-phone-number-input/input"
import styles from "./label.module.css"

export const TextLabel = ({plhld, ident, value, onChange}) => {
    return (
    <input
      type="text"
      id={ident}
      value={value}
      placeholder={plhld}
      className={styles.label}
      onChange={onChange}
    />
  );
}

export const EmailLabel = ({plhld, ident, value, onChange}) => {
    return (
    <input
      type="email"
      id={ident}
      value={value}
      placeholder={plhld}
      className={styles.label}
      onChange={onChange}
    />
  );
}
