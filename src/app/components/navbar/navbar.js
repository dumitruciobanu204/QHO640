"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '../../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { checkAdminStatus } from '../../utils/checkAdminStatus';
import styles from './navbar.module.css';

const Navbar = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const checkAuthStatus = async () => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setIsLoggedIn(true);
                    setUserEmail(user.email);

                    const { isAdmin } = await checkAdminStatus();
                    setIsAdmin(isAdmin);
                } else {
                    setIsLoggedIn(false);
                    setIsAdmin(false);
                    setUserEmail('');
                }
            });

            return () => unsubscribe();
        };

        checkAuthStatus();
    }, []);

    return (
        <nav className={styles.navbar}>
            <ul className={styles.navList}>
                <li className={styles.navItem}>
                    <Link href="/">Home</Link>
                </li>
                <li className={styles.navItem}>
                    <Link href={isAdmin ? "/myBookings" : "/myBookings"}>
                        {isAdmin ? 'Manage Bookings' : 'My Bookings'}
                    </Link>
                </li>
                {isAdmin && (
                    <>
                        <li className={styles.navItem}>
                            <Link href="/manageAccommodations">Manage Accommodations</Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link href="/uploadAccommodation">Upload Accommodation</Link>
                        </li>
                    </>
                )}
                <li className={styles.loginContainer}>
                    {isLoggedIn && (
                        <span className={styles.loggedInText}>
                            Logged in as: {userEmail}
                        </span>
                    )}
                    <div className={styles.loginButton}>
                        {isLoggedIn ? (
                            <button onClick={() => auth.signOut()}>Logout</button>
                        ) : (
                            <Link href="/login">Login</Link>
                        )}
                    </div>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
