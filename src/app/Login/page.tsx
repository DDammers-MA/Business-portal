import styles from "./login.module.scss";

export default function Login() {
    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <img src="/logo.png" alt="Logo" className={styles.logo} />
                <h2 className={styles.title}>Login</h2>
                <input
                    type="text"
                    placeholder="Company name"
                    className={styles.inputField}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className={styles.inputField}
                />
                <a href="#" className={styles.forgotPassword}>
                    Forgot password
                </a>
                <button className={styles.loginButton}>Login</button>
            </div>
        </div>
    );
}