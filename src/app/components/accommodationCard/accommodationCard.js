import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './accommodationCard.module.css';


const AccommodationCard = ({ accommodation }) => {
  const { id, name, type, imgUrl } = accommodation;
  const router = useRouter();

  const handleBooking = () => {
    router.push(`/booking/${id}`);
  };

  return (
    <div className={styles.card}>
      <img src={imgUrl} alt={name} className={styles.image} />
      <div className={styles.info}>
        <h3 className={styles.name}>
          {name} <span className={styles.type}>{type}</span>
        </h3>
        <button className={styles.button} onClick={handleBooking}>Book Now</button>
      </div>
    </div>
  );
};

export default AccommodationCard;
