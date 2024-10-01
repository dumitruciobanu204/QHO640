"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    fetchBookingById,
    updateBooking,
    deleteBooking,
    fetchAccommodationById,
    fetchAvailabilityForRange,
    updateAvailability,
    increaseAvailability
} from '../../utils/getAccommodations';
import { auth } from '../../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { checkAdminStatus } from '../../utils/checkAdminStatus';
import styles from './editBooking.module.css';

const EditBooking = ({ params }) => {
    const { id: bookingId } = params;
    const [bookingData, setBookingData] = useState(null);
    const [accommodation, setAccommodation] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [numRooms, setNumRooms] = useState(1);
    const [previousNumRooms, setPreviousNumRooms] = useState(1);
    const [numNights, setNumNights] = useState(1);
    const [availabilityStatus, setAvailabilityStatus] = useState('');
    const [bookingAllowed, setBookingAllowed] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [previousDate, setPreviousDate] = useState('');
    const alertShown = useRef(false);

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsLoggedIn(true);
                setUserId(user.uid);

                const adminStatus = await checkAdminStatus(user);
                setIsAdmin(adminStatus);

            } else {
                alert('You must be logged in to edit a booking.');
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        const fetchBookingData = async () => {
            const result = await fetchBookingById(bookingId);
            if (result.success) {
                const bookingOwnerId = result.data.userId;

                if (!userId) {
                    console.log('User ID not set yet.');
                    return;
                }

                if (bookingOwnerId !== userId && !isAdmin) {
                    if (!alertShown.current) {
                        alert('You do not have permission to edit this booking.');
                        alertShown.current = true;
                    }
                    router.push('/myBookings');
                    return;
                }

                setBookingData({ ...result.data, id: bookingId });
                setSelectedDate(result.data.startDate);
                setNumRooms(result.data.rooms);
                setPreviousNumRooms(result.data.rooms);
                setNumNights(result.data.nights);
                setPreviousDate(result.data.startDate);
                fetchAccommodationData(result.data.accommodationId);
            } else {
                console.error(result.message);
            }
        };

        if (userId) {
            fetchBookingData();
        }
    }, [bookingId, userId, router, isAdmin]);

    const fetchAccommodationData = async (accommodationId) => {
        try {
            const fetchedAccommodation = await fetchAccommodationById(accommodationId);
            setAccommodation(fetchedAccommodation);
        } catch (error) {
            console.error("Error fetching accommodation data:", error);
        }
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        setBookingAllowed(false);
        setAvailabilityStatus(null);
    };

    const handleRoomsChange = (event) => {
        setNumRooms(parseInt(event.target.value));
        setBookingAllowed(false);
        setAvailabilityStatus(null);
    };

    const handleNightsChange = (event) => {
        setNumNights(parseInt(event.target.value));
        setBookingAllowed(false);
        setAvailabilityStatus(null);
    };

    const checkAvailability = async () => {
        if (selectedDate && numRooms > 0 && numNights > 0) {
            try {
                const result = await fetchAvailabilityForRange(accommodation.id, selectedDate, numNights, numRooms);
                if (result.success) {
                    setAvailabilityStatus(`Sufficient rooms available for ${numNights} nights.`);
                    setBookingAllowed(true);
                } else {
                    setAvailabilityStatus(result.message);
                    setBookingAllowed(false);
                }
            } catch (error) {
                console.error("Error checking availability:", error);
                setAvailabilityStatus("Error checking availability.");
                setBookingAllowed(false);
            }
        }
    };

    useEffect(() => {
        if (accommodation) {
            checkAvailability();
        }
    }, [selectedDate, numRooms, numNights, accommodation]);

    const handleUpdateBooking = async () => {
        if (bookingData && accommodation && bookingAllowed) {
            const updates = { rooms: numRooms, startDate: selectedDate, nights: numNights };

            if (selectedDate !== previousDate || numNights !== bookingData.nights || numRooms !== previousNumRooms) {
                await increaseAvailability(accommodation.id, previousDate, bookingData.nights, previousNumRooms);
                await decreaseAvailability(numRooms, accommodation.id, selectedDate, numNights);
            }

            const bookingUpdateResult = await updateBooking(bookingId, updates);

            if (bookingUpdateResult.success) {
                alert('Booking updated successfully');
                router.push('/myBookings');
            } else {
                setAvailabilityStatus(bookingUpdateResult.message);
            }
        } else {
            setAvailabilityStatus('Please ensure all fields are correct and check availability.');
        }
    };

    const decreaseAvailability = async (numRooms, accommodationId, selectedDate, numNights) => {
        const availabilityUpdateResult = await updateAvailability(accommodationId, selectedDate, numNights, numRooms);
        if (availabilityUpdateResult.success) {
            setAvailabilityStatus('Booking updated successfully.');
        } else {
            setAvailabilityStatus(availabilityUpdateResult.message);
        }
    };

    const handleDeleteBooking = async () => {
        if (window.confirm("Are you sure you want to delete this booking?")) {
            if (bookingData && accommodation) {
                const bookingIdToDelete = bookingData.id;
                const previousDate = bookingData.startDate;
                const previousNumRooms = bookingData.rooms;
                const previousNumNights = bookingData.nights;

                try {
                    await increaseAvailability(accommodation.id, previousDate, previousNumNights, previousNumRooms);

                    const deleteResult = await deleteBooking(bookingIdToDelete);

                    if (deleteResult.success) {
                        alert('Booking deleted successfully.');
                        router.push('/myBookings');
                    } else {
                        alert(deleteResult.message);
                    }
                } catch (error) {
                    console.error("Error deleting booking:", error);
                    alert('Error deleting booking. Please try again.');
                }
            }
        }
    };

    return (
        <div className={styles.editBookingPage}>
            {bookingData && accommodation ? (
                <div className={styles.bookingDetails}>
                    <h2 className={styles.heading}>Edit Booking for {accommodation.name}</h2>
                    <p className={styles.paragraph}>Location: {accommodation.location}</p>
                    <p className={styles.paragraph}>Type: {accommodation.type}</p>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Select New Date: </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className={styles.inputField}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Rooms: </label>
                        <input
                            type="number"
                            value={numRooms}
                            min="1"
                            onChange={handleRoomsChange}
                            className={styles.inputField}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nights: </label>
                        <input
                            type="number"
                            value={numNights}
                            min="1"
                            onChange={handleNightsChange}
                            className={styles.inputField}
                        />
                    </div>

                    {availabilityStatus && <p className={styles.availabilityMessage}>{availabilityStatus}</p>}

                    <button onClick={handleUpdateBooking} disabled={!bookingAllowed} className={styles.updateButton}>
                        Update Booking
                    </button>

                    <button onClick={handleDeleteBooking} className={styles.deleteButton}>
                        Delete Booking
                    </button>
                </div>
            ) : (
                <p>Loading booking data...</p>
            )}
        </div>
    );
};

export default EditBooking;
