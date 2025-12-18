import styles from "../pages/monitor.module.css"

export const Checkbox = ({ind, plhld, value, onChange}: {ind: string, plhld: string, value: boolean, onChange: any}) => {
    return (
        <>
            <input type="checkbox" id={ind} defaultChecked={value} onChange={(e) => onChange(e.target.checked)} />
            <label htmlFor={ind} className={styles.small_text}>{plhld}</label>
        </>
    );
}