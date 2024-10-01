"use client";

import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

export const fetchAccommodations = async (searchParams = {}) => {
    const { location = '', type = '' } = searchParams;

    const accommodationsRef = collection(db, 'accommodations');
    let q = query(accommodationsRef);

    if (location) {
        q = query(accommodationsRef, where('location', '==', location));
    }
    if (type) {
        q = query(accommodationsRef, where('type', '==', type));
    }

    const querySnapshot = await getDocs(q);
    const accommodations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return accommodations;
};

export const fetchAccommodationById = async (id) => {
    try {
        const docRef = doc(db, 'accommodations', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error("Accommodation not found");
        }
    } catch (error) {
        console.error("Error getting accommodation data:", error);
        throw error;
    }
};

export const updateAvailability = async (id, startDate, numNights, numRooms) => {
    try {
        const accommodationRef = doc(db, 'accommodations', id);
        const accommodationSnap = await getDoc(accommodationRef);

        if (!accommodationSnap.exists()) {
            return { success: false, message: 'Accommodation not found' };
        }

        const accommodationData = accommodationSnap.data();
        const availability = accommodationData.availability || {};

        const start = new Date(startDate);
        for (let i = 0; i < numNights; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];

            if (availability[dateString] === undefined || availability[dateString] < numRooms) {
                return { success: false, message: `Insufficient rooms available for ${dateString}` };
            }

            availability[dateString] = Math.max(0, availability[dateString] - numRooms);
        }

        await updateDoc(accommodationRef, { availability });

        return { success: true };
    } catch (error) {
        console.error("Error updating availability:", error);
        return { success: false, message: "Error updating availability." };
    }
};


export const fetchAvailabilityForDate = async (id, selectedDate) => {
    try {
        const accommodation = await fetchAccommodationById(id);

        if (accommodation && accommodation.availability) {
            const availability = accommodation.availability[selectedDate];
            if (availability !== undefined) {
                return availability;
            } else {
                console.log(`No room availability for ${selectedDate}`);
                return 0;
            }
        } else {
            throw new Error('Accommodation is not available.');
        }
    } catch (error) {
        console.error("Error getting availability for date:", error);
        throw error;
    }
};

export const fetchAvailabilityForRange = async (id, startDate, numNights, numRooms) => {
    try {
        const accommodationRef = doc(db, 'accommodations', id);
        const accommodationSnap = await getDoc(accommodationRef);

        if (!accommodationSnap.exists()) {
            return { success: false, message: 'Accommodation not found' };
        }

        const availability = accommodationSnap.data().availability || {};
        const start = new Date(startDate);
        let availableNights = 0;
        
        for (let i = 0; i < numNights; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];

            if (availability[dateString] === undefined) {
                return { success: false, message: `No rooms available for ${dateString}.` };
            }

            if (availability[dateString] < numRooms) {
                return { success: false, message: `${availability[dateString]} rooms available for ${numNights} nights starting from ${dateString}.` };
            }

            availableNights++;
        }

        if (availableNights >= numNights) {
            return { success: true };
        } else {
            return { success: false, message: `${availableNights} nights available out of ${numNights}.` };
        }
    } catch (error) {
        console.error("Error getting availability:", error);
        return { success: false, message: "Error getting availability." };
    }
};

export const addBooking = async (bookingData) => {
    try {
        const bookingsRef = collection(db, 'bookings');
        const docRef = await addDoc(bookingsRef, bookingData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding booking: ", error);
        return { success: false, message: "Error adding booking." };
    }
};

export const fetchUserBookings = async (userId) => {
    try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const bookings = await Promise.all(
            querySnapshot.docs.map(async (docSnap) => {
                const bookingData = docSnap.data();
                const accommodationRef = doc(db, 'accommodations', bookingData.accommodationId);
                const accommodationDoc = await getDoc(accommodationRef);
                const accommodationData = accommodationDoc.data();
                
                return {
                    id: docSnap.id,
                    ...bookingData,
                    accommodation: accommodationData,
                };
            })
        );

        return bookings;
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        throw new Error('Error fetching user bookings.');
    }
};

export const fetchAllBookings = async () => {
    try {
        const bookingsRef = collection(db, 'bookings');
        const querySnapshot = await getDocs(bookingsRef);

        const bookings = await Promise.all(
            querySnapshot.docs.map(async (docSnap) => {
                const bookingData = docSnap.data();
                const accommodationRef = doc(db, 'accommodations', bookingData.accommodationId);
                const accommodationDoc = await getDoc(accommodationRef);
                const accommodationData = accommodationDoc.data();
                
                return {
                    id: docSnap.id,
                    ...bookingData,
                    accommodation: accommodationData,
                };
            })
        );

        return bookings;
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        throw new Error('Error fetching all bookings.');
    }
};

export const fetchBookingById = async (bookingId) => {
    try {
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingDoc = await getDoc(bookingRef);

        if (bookingDoc.exists()) {
            return { success: true, data: bookingDoc.data() };
        } else {
            return { success: false, message: 'Booking not found' };
        }
    } catch (error) {
        console.error("Error fetching booking:", error);
        return { success: false, message: 'Error fetching booking' };
    }
};

export const updateBooking = async (bookingId, updates) => {
    try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, updates);
        return { success: true };
    } catch (error) {
        console.error("Error updating booking:", error);
        return { success: false, message: 'Error updating booking' };
    }
};

export const increaseAvailability = async (id, startDate, numNights, numRooms) => {
    try {
        const accommodationRef = doc(db, 'accommodations', id);
        const accommodationSnap = await getDoc(accommodationRef);

        if (!accommodationSnap.exists()) {
            return { success: false, message: 'Accommodation not found' };
        }

        const accommodationData = accommodationSnap.data();
        const availability = accommodationData.availability || {};

        const start = new Date(startDate);
        for (let i = 0; i < numNights; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];

            availability[dateString] = (availability[dateString] || 0) + numRooms;
        }

        await updateDoc(accommodationRef, { availability });

        return { success: true };
    } catch (error) {
        console.error("Error increasing availability:", error);
        return { success: false, message: "Error increasing availability." };
    }
};

export const deleteBooking = async (bookingId) => {
    try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await deleteDoc(bookingRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting booking:", error);
        return { success: false, message: 'Error deleting booking.' };
    }
};
