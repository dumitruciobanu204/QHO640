import EditBooking from '../../components/editBooking/editBooking';

const BookingPage = ({ params }) => {
    return (
        <div>
            <EditBooking params={params} />
        </div>
    );
};

export default BookingPage;
