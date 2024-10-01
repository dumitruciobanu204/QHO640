import Booking from '../../components/booking/booking';

const BookingPage = ({ params }) => {
    return (
        <div>
            <Booking params={params} />
        </div>
    );
};

export default BookingPage;
