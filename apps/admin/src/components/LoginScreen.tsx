import styles from "../app/page.module.css";
import { login } from "../utils/auth";

export function LoginScreen() {
  return (
    <main className={styles.loginWrap}>
      <form action={login} className={styles.loginCard}>
        <h1>Sign in to your account</h1>
        <label htmlFor="password">Password</label>
        <input className={styles.input} id="password" name="password" type="password" />
        <button className={styles.button} type="submit">Sign In</button>
      </form>
    </main>
  );
}
