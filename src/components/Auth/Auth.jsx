import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebase";
import styles from "./Auth.module.scss";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("No pudimos iniciar sesión. Revisá el correo y la contraseña.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.authContainer} onSubmit={handleLogin}>
      <h1 className={styles.authTitle}>Ingresá a tus planillas</h1>
      <div className={styles.authInputContainer}>
        <div className={styles.authInputGroup}>
          <label className={styles.authLabel} htmlFor="email">Correo electrónico</label>
          <input id="email" className={styles.authInput} type="email" autoComplete="email" required placeholder="nombre@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className={styles.authInputGroup}>
          <label className={styles.authLabel} htmlFor="password">Contraseña</label>
          <div className={styles.passwordWrapper}>
            <input id="password" className={styles.authInput} placeholder="Tu contraseña" autoComplete="current-password" required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className={styles.showPasswordButton} onClick={() => setShowPassword((prev) => !prev)} aria-pressed={showPassword}>
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>
      </div>
      {error && <div className={styles.authError} role="alert">{error}</div>}
      <button className={`btn btn--primario ${styles.loginButton}`} disabled={submitting} type="submit">
        {submitting ? "Ingresando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
