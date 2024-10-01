"use client";

import { useState } from 'react';
import styles from './search.module.css';

const Search = ({ onSearch }) => {
    const [location, setLocation] = useState('');
    const [type, setType] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch({ location, type });
    };

    const handleClear = () => {
        setLocation('');
        setType('');
        onSearch({ location: '', type: '' });
    };

    return (
        <div className={styles.searchContainer}>
            <h2 className={styles.searchTitle}>Places To Stay - Search Accommodations</h2>
            <form onSubmit={handleSearch} className={styles.form}>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter Location"
                    className={styles.input}
                />
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={styles.select}
                >
                    <option value="">Select Type</option>
                    <option value="hotel">Hotel</option>
                    <option value="hostel">Hostel</option>
                    <option value="campsite">Campsite</option>
                </select>
                <div className={styles.buttonContainer}>
                    <button type="submit" className={styles.button}>Search</button>
                    <button type="button" onClick={handleClear} className={`${styles.button} ${styles.clearButton}`}>Clear</button>
                </div>
            </form>
        </div>
    );
};

export default Search;
