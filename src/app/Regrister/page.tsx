import styles from "./regrister.module.scss";

export default function Register() {
    return(
        <div className={styles.container}>
            <div className={styles.registerBox}>
                <img src="/logo.png" alt="Logo" className={styles.logo} />
                <h2 className={styles.title}>Register</h2>
                <input
                    type="text"
                    placeholder="Company name"
                    className={styles.inputField}
                />
        </div>
        </div>
    )
}