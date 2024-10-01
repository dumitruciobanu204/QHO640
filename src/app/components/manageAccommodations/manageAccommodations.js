"use client";

import { useEffect, useState, useRef } from 'react';
import { fetchAccommodations } from '../../utils/getAccommodations';
import { checkAdminStatus } from '../../utils/checkAdminStatus';
import { deleteAccommodation, deleteBookingsForAccommodation, fetchBookingsForAccommodation } from '../../utils/manageAccommodations'; 
import { useRouter } from 'next/navigation';
import styles from './manageAccommodations.module.css';

const ManageAccommodations = () => {
    const [accommodations, setAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);
    const router = useRouter();
    const alertShownRef = useRef(false);

    useEffect(() => {
        const fetchAdminStatus = async () => {
            try {
                const { isAdmin } = await checkAdminStatus();
                setIsAdmin(isAdmin);
                if (!isAdmin && !alertShownRef.current) {
                    alert('Unauthorized access. Redirecting to the home page...');
                    alertShownRef.current = true;
                    router.push('/');
                }
            } catch (err) {
                setError('Failed to check admin status.');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminStatus();
    }, [router]);

    useEffect(() => {
        const fetchAccommodationsData = async () => {
            if (isAdmin) {
                try {
                    const data = await fetchAccommodations();
                    setAccommodations(data);
                } catch (err) {
                    setError('Failed to fetch accommodations.');
                }
            }
        };

        if (isAdmin) {
            fetchAccommodationsData();
        }
    }, [isAdmin]);

    const handleEdit = (id) => {
        router.push(`/editAccommodation/${id}`);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this accommodation?');
        if (confirmDelete) {
            try {
                const bookings = await fetchBookingsForAccommodation(id);
                if (bookings.length > 0) {
                    const confirmDeleteWithBookings = window.confirm('This accommodation has existing bookings. Do you want to delete it along with its bookings?');
                    if (!confirmDeleteWithBookings) {
                        return;
                    }
                    await deleteBookingsForAccommodation(id);
                }
                await deleteAccommodation(id);
                setAccommodations(accommodations.filter((accommodation) => accommodation.id !== id));
                alert('Accommodation deleted along with its bookings.');
            } catch (error) {
                console.error('Error details:', error);
                setError('Failed to delete accommodation and its bookings.');
            }
        }
    };
    
    if (loading || isAdmin === false) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            {accommodations.length === 0 ? (
                <p className={styles.noData}>No accommodations available.</p>
            ) : (
                <ul className={styles.accommodationList}>
                    {accommodations.map((accommodation) => (
                        <li key={accommodation.id} className={styles.accommodationItem}>
                            <div className={styles.imageContainer}>
                                <img src={accommodation.imgUrl} alt={accommodation.name} className={styles.accommodationImage} />
                            </div>
                            <div className={styles.detailsContainer}>
                                <h2 className={styles.accommodationName}>{accommodation.name}</h2>
                                <p>Location: <span>{accommodation.location}</span></p>
                                <p>Type: <span>{accommodation.type}</span></p>
                                <p>Availability:</p>
                                <ul className={styles.availabilityList}>
                                    {Object.entries(accommodation.availability).map(([date, count]) => (
                                        <li key={date}>
                                            {date}: <span>{count} rooms available</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className={styles.buttonGroup}>
                                    <button onClick={() => handleEdit(accommodation.id)} className={styles.editButton}>Edit</button>
                                    <button onClick={() => handleDelete(accommodation.id)} className={styles.deleteButton}>Delete</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ManageAccommodations;
