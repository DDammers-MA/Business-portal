import styles from "./regrister.module.scss";

export default function Register() {
    return (
        <div className={styles.container}>
            <div className={styles.registerBox}>
                <img src="/logo.png" alt="Logo" className={styles.logo} />
                <h2 className={styles.title}>Register</h2>
                <input
                    type="text"
                    placeholder="Company name"
                    className={styles.inputField}
                />
                <input
                    type="email"
                    placeholder="Company email"
                    className={styles.inputField}
                />
                <input
                    type="tel"
                    placeholder="Phone number"
                    className={styles.inputField}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className={styles.inputField}
                />
                <input
                    type="password"
                    placeholder="Repeat password"
                    className={styles.inputField}
                />
                <div className={styles.buttonContainer}>
                    <button className={styles.loginButton}>Login</button>
                    <button className={styles.registerButton}>Register</button>
                </div>
            </div>
        </div>
    );
}