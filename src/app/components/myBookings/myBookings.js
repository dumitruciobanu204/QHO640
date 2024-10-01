"use client";

import React, { useState, useEffect } from 'react';
import { checkAdminStatus } from '../../utils/checkAdminStatus';
import { fetchUserBookings, fetchAllBookings } from '../../utils/getAccommodations';
import { formatDate } from '../../utils/dateUtils';
import styles from './myBookings.module.css';
import { useRouter } from 'next/navigation';

const MyBookings = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { user, isAdmin } = await checkAdminStatus();
                if (user) {
                    setUser(user);
                    setIsAdmin(isAdmin);

                    if (isAdmin) {
                        const allBookings = await fetchAllBookings();
                        setBookings(allBookings);
                    } else {
                        const userBookings = await fetchUserBookings(user.uid);
                        setBookings(userBookings);
                    }
                } else {
                    setError('You need to be logged in to view your bookings.');
                    setTimeout(() => router.push('/login'), 3000); 
                }
            } catch (error) {
                setError('Failed to load bookings.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [router]);

    if (loading) return <div className={styles.loader}>Loading...</div>;
    if (error) return <p>{error}</p>;

    const handleEdit = (bookingId) => {
        router.push(`/editBooking/${bookingId}`);
    };

    const handleImageError = (e) => {
        e.target.src = '/path/to/default-image.jpg'; 
    };

    return (
        <div className={styles.container}>
            {bookings.length > 0 ? (
                <ul className={styles.bookingList}>
                    {bookings.map((booking) => (
                        <li key={booking.id} className={styles.bookingItem}>
                            <div className={styles.imageSection}>
                                <img
                                    src={booking.accommodation.imgUrl}
                                    alt={`Image of ${booking.accommodation.name}`}
                                    className={styles.accommodationImage}
                                    onError={handleImageError}
                                />
                            </div>
                            <div className={styles.detailsSection}>
                                <h2>{booking.accommodation.name}</h2>
                                <p>Location: {booking.accommodation.location}</p>
                                <p>Type: {booking.accommodation.type}</p>
                                <p>Rooms: {booking.rooms}</p>
                                <p>Nights: {booking.nights}</p>
                                <p>Booking Date: {formatDate(booking.startDate)}</p>

                                {isAdmin && (
                                    <>
                                        <p>Booked On: {booking.bookingDate}</p>
                                        <p>User Email: {booking.userEmail}</p>
                                        <p>Accommodation ID: {booking.accommodationId}</p>
                                    </>
                                )}

                                <button onClick={() => handleEdit(booking.id)} className={styles.editButton}>
                                    Edit Booking
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No bookings found.</p>
            )}
        </div>
    );
};

export default MyBookings;
