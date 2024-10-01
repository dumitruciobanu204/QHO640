import { auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export const checkAdminStatus = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const tokenResult = await user.getIdTokenResult();
                    const isAdmin = tokenResult.claims.admin || false;
                    resolve({ user, isAdmin });
                } catch (error) {
                    reject('Failed to determine admin status.');
                }
            } else {
                resolve({ user: null, isAdmin: false });
            }
        });

        return () => unsubscribe();
    });
};
