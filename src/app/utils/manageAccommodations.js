import { doc, deleteDoc, collection, getDocs, updateDoc, addDoc, query, where, writeBatch } from 'firebase/firestore'; 
import { db } from '../../firebase/firebaseConfig';

export const deleteAccommodation = async (id) => {
    try {
        const accommodationRef = doc(db, 'accommodations', id);
        await deleteDoc(accommodationRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting accommodation:", error);
        throw new Error("Failed to delete accommodation.");
    }
};

export const fetchBookingsForAccommodation = async (accommodationId) => {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('accommodationId', '==', accommodationId));
    const snapshot = await getDocs(q);

    const bookings = [];
    snapshot.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data() });
    });

    return bookings;
};

export const deleteBookingsForAccommodation = async (accommodationId) => {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('accommodationId', '==', accommodationId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return;
    }

    const batch = writeBatch(db);
    snapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
};

export const updateAccommodation = async (id, data) => {
    try {
        const accommodationRef = doc(db, 'accommodations', id);
        await updateDoc(accommodationRef, data);
    } catch (error) {
        console.error('Error updating accommodation:', error);
        throw new Error('Could not update accommodation.');
    }
};

export const addAccommodation = async (data) => {
    try {
        const docRef = await addDoc(collection(db, 'accommodations'), data);
        console.log('Accommodation added with ID: ', docRef.id);
    } catch (error) {
        console.error('Error adding accommodation: ', error);
        throw new Error('Could not add accommodation');
    }
};