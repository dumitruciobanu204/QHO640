    "use client";

    import { useEffect, useState, useRef } from 'react';
    import { useRouter } from 'next/navigation';
    import { fetchAccommodationById } from '../../utils/getAccommodations';
    import { updateAccommodation } from '../../utils/manageAccommodations';
    import { checkAdminStatus } from '../../utils/checkAdminStatus';
    import './editAccommodation.css';

    const EditAccommodation = ({ params }) => {
        const { id } = params;
        const router = useRouter();
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [formData, setFormData] = useState({
            name: '',
            location: '',
            type: '',
            imgUrl: '',
            availability: {}
        });
        const alertShownRef = useRef(false);

        useEffect(() => {
            const fetchAdminStatus = async () => {
                try {
                    const { isAdmin } = await checkAdminStatus();
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
            const fetchAccommodation = async () => {
                try {
                    const data = await fetchAccommodationById(id);
                    setFormData(data);
                } catch (err) {
                    setError('Failed to fetch accommodation details.');
                }
            };

            fetchAccommodation();
        }, [id]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        };

        const handleAvailabilityChange = (date, value) => {
            setFormData((prev) => ({
                ...prev,
                availability: {
                    ...prev.availability,
                    [date]: Number(value)
                }
            }));
        };

        const handleAddDate = () => {
            const newDate = prompt("Enter a new date (YYYY-MM-DD):");
            if (newDate) {
                setFormData((prev) => ({
                    ...prev,
                    availability: {
                        ...prev.availability,
                        [newDate]: 0
                    }
                }));
            }
        };

        const handleRemoveDate = (date) => {
            const updatedAvailability = { ...formData.availability };
            delete updatedAvailability[date];
            setFormData((prev) => ({
                ...prev,
                availability: updatedAvailability
            }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                await updateAccommodation(id, formData);
                alert('Accommodation updated successfully.');
                router.push('/manageAccommodations');
            } catch (err) {
                setError('Failed to update accommodation.');
            }
        };

        if (loading) {
            return <div style={{ textAlign: 'center', margin: '20px' }}>Loading...</div>;
        }

        if (error) {
            return <div style={{ color: 'red', textAlign: 'center', margin: '20px' }}>{error}</div>;
        }

        return (
            <div className="container">
                <h1 className="title">Edit Accommodation</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Location:</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Type:</label>
                        <input
                            type="text"
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="imgUrl">Image URL:</label>
                        <input
                            type="url"
                            id="imgUrl"
                            name="imgUrl"
                            value={formData.imgUrl}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <h2 style={{ marginBottom: '10px' }}>Availability</h2>
                    <button type="button" onClick={handleAddDate} className="btn">
                        Add Date
                    </button>
                    {Object.entries(formData.availability).map(([date, count]) => (
                        <div key={date} className="form-group">
                            <label htmlFor={`availability-${date}`}>{date}:</label>
                            <input
                                type="number"
                                id={`availability-${date}`}
                                value={count}
                                onChange={(e) => handleAvailabilityChange(date, e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => handleRemoveDate(date)} className="btn btn-remove">
                                Remove
                            </button>
                        </div>
                    ))}
                    <button type="submit" className="btn">
                        Update Accommodation
                    </button>
                </form>
            </div>
        );
    };

    export default EditAccommodation;
