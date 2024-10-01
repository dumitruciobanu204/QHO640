"use client";

import React, { useState, useEffect } from 'react';
import { fetchAccommodationById, fetchAvailabilityForRange, updateAvailability, addBooking } from '../../utils/getAccommodations';
import { auth } from '../../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './booking.module.css';

const formatDateTime = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const Booking = ({ params }) => {
    const { id: accommodationId } = params;
    const [selectedDate, setSelectedDate] = useState('');
    const [numRooms, setNumRooms] = useState(1);
    const [numNights, setNumNights] = useState(1);
    const [availabilityStatus, setAvailabilityStatus] = useState(null);
    const [bookingAllowed, setBookingAllowed] = useState(false);
    const [accommodation, setAccommodation] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleDateChange = async (event) => {
        setSelectedDate(event.target.value);
        setBookingAllowed(false);
        setAvailabilityStatus(null);
    };

    const handleRoomsNightsChange = async () => {
        if (selectedDate && numRooms > 0 && numNights > 0) {
            try {
                const result = await fetchAvailabilityForRange(accommodationId, selectedDate, numNights, numRooms);
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
        const fetchAccommodationData = async () => {
            try {
                const fetchedAccommodation = await fetchAccommodationById(accommodationId);
                setAccommodation(fetchedAccommodation);
            } catch (error) {
                console.error("Error fetching accommodation data:", error);
            }
        };

        fetchAccommodationData();
    }, [accommodationId]);

    useEffect(() => {
        handleRoomsNightsChange();
    }, [selectedDate, numRooms, numNights]);

    const handleBooking = async () => {
        if (bookingAllowed) {
            if (isLoggedIn) {
                try {
                    const user = auth.currentUser;
                    const result = await updateAvailability(accommodationId, selectedDate, numNights, numRooms);
                    if (result.success) {
                        const bookingData = {
                            accommodationId,
                            userId: user.uid,
                            userEmail: user.email,
                            startDate: selectedDate,
                            rooms: numRooms,
                            nights: numNights,
                            bookingDate: formatDateTime(new Date()),
                        };

                        const bookingResult = await addBooking(bookingData);
                        if (bookingResult.success) {
                            setAvailabilityStatus(`Booking confirmed for ${numNights} nights.`);
                        } else {
                            setAvailabilityStatus(bookingResult.message);
                        }
                    } else {
                        setAvailabilityStatus(result.message);
                    }
                } catch (error) {
                    console.error("Error processing booking:", error);
                    setAvailabilityStatus("Error processing booking.");
                }
            } else {
                alert("Please log in to make a booking.");
            }
        }
    };

    return (
        <div className={styles.bookingPage}>
            <div className={styles.bookingContainer}>
                {accommodation && (
                    <>
                        <div className={styles.imageSection}>
                            <img
                                src={accommodation.imgUrl}
                                alt={accommodation.name}
                                className={styles.accommodationImage}
                            />
                        </div>
                        <div className={styles.formSection}>
                            <h1 className={styles.title}>Book {accommodation.name}</h1>

                            <div className={styles.formGroup}>
                                <label>Select Date: </label>
                                <input type="date" value={selectedDate} onChange={handleDateChange} className={styles.inputField} />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Number of Rooms: </label>
                                <input
                                    type="number"
                                    value={numRooms}
                                    min="1"
                                    onChange={(e) => setNumRooms(parseInt(e.target.value))}
                                    className={styles.inputField}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Number of Nights: </label>
                                <input
                                    type="number"
                                    value={numNights}
                                    min="1"
                                    onChange={(e) => setNumNights(parseInt(e.target.value))}
                                    className={styles.inputField}
                                />
                            </div>

                            <div>
                                <p className={styles.availabilityMessage}>{availabilityStatus}</p>
                            </div>

                            <button onClick={handleBooking} disabled={!bookingAllowed} className={styles.bookingButton}>
                                Confirm Booking
                            </button>
                        </div>
                    </>
                )}
                {!accommodation && (
                    <p>Loading accommodation details...</p>
                )}
            </div>
        </div>
    );
};

export default Booking;
