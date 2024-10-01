"use client";

import React, { useEffect, useState } from 'react';
import { fetchAccommodations } from './utils/getAccommodations';
import AccommodationCard from './components/accommodationCard/accommodationCard';
import Search from './components/search/search';

const HomePage = () => {
  
  const [accommodations, setAccommodations] = useState([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState([]);

  useEffect(() => {
    const loadAccommodations = async () => {
      const data = await fetchAccommodations();
      setAccommodations(data);
      setFilteredAccommodations(data);
    };

    loadAccommodations();
  }, []);

  const handleSearch = (searchCriteria) => {
    const { location, type } = searchCriteria;

    const filtered = accommodations.filter((accommodation) => {
      const matchesLocation = location ? accommodation.location.toLowerCase().includes(location.toLowerCase()) : true;
      const matchesType = type ? accommodation.type.toLowerCase() === type.toLowerCase() : true;
      return matchesLocation && matchesType;
    });

    setFilteredAccommodations(filtered);
  };

  return (
    <div>
      <div className="banner">
        <Search onSearch={handleSearch} />
      </div>
      <div className="accommodations-grid">
        {filteredAccommodations.length > 0 ? (
          filteredAccommodations.map(accommodation => (
            <AccommodationCard
              key={accommodation.id}
              accommodation={accommodation}
            />
          ))
        ) : (
          <p>No accommodations found.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
