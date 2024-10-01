import React, { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { auth, provider, signInWithPopup } from '../../../firebase/firebaseConfig';
import { signInWithEmailAndPassword as login } from 'firebase/auth';
import { checkAdminStatus } from '../../utils/checkAdminStatus';
import styles from './login.module.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const { isAdmin } = await checkAdminStatus();
            
            if (isAdmin) {
                router.push('/');
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Google sign-in error:', error.message);
            setError('Google login failed. Please try again.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const userCredential = await login(auth, email, password);
            const user = userCredential.user;

            const { isAdmin } = await checkAdminStatus();

            if (isAdmin) {
                router.push('/');
            } else {
                router.push('/');
            }

        } catch (error) {
            console.error('Login error:', error.message);
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Login</h2>

                {error && <p className={styles.errorMessage}>{error}</p>}

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <button type="submit" className={styles.button}>Login</button>
                </form>

                <div className="social-login">
                    <button onClick={handleGoogleSignIn} className={styles.button}>
                        <FaGoogle /> Login with Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
