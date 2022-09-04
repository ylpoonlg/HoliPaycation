import Footer from "../Footer";

function HomePage() {
  let tripID = '';

  function onJoinTrip() {
    //console.log('Joining trip: ' + tripID);
    if (tripID === '') {
      alert('Please enter a valid trip id.');
      return;
    }
    // TODO: Check if trip exist
    window.location.assign('/' + tripID);
  }

  return (
    <div className='min-h-screen min-w-full bg-gray-100 relative'>
      <h1 className='text-gray-800 text-center text-3xl sm:text-5xl
                     font-semibold pt-4'>
        Welcome to 
        <span className='font-extrabold text-blue-800'
          style={{fontFamily: "'Signika', sans-serif"}}
        > HoliPaycation</span>!
      </h1>

      <div className='absolute w-full top-1/2 m-auto -translate-y-1/2 px-6 pb-36'>
        <button className='block mx-auto text-center text-2xl px-6 py-4
                           sm:text-4xl sm:px-12
                           text-white bg-blue-600 hover:bg-blue-700 rounded-full
                           shadow-md shadow-blue-200 w-full max-w-sm'
            onClick={(_) => {window.location.assign('/create-trip');}}>
          Create a Trip
        </button>

        <div className='mt-12 mb-8 text-center text-2xl'>
          <span>or</span>
        </div>

        <div className='text-center mb-8'>
          <label htmlFor='trip-id'
                 className='block text-blue-900 text-3xl font-semibold'>
            Join A Trip</label>
          <input name='trip-id' type='text' placeholder='Enter Trip ID'
            className='block mx-auto my-4 px-2 py-1 w-full max-w-xs
                       rounded-lg border-2 border-blue-400'
            maxLength={6}
            onChange={(e) => {tripID = e.target.value;}}
          />
          <button className='block mx-auto px-4 py-1 bg-blue-400 hover:bg-blue-500
                             text-white rounded-xl max-w-xs w-full'
                            onClick={onJoinTrip}>
            Go to Form</button>
        </div>
      </div>
      <div className='pt-96'><div className='pt-36'>
        <Footer />
      </div></div>
    </div>
  );
}

export default HomePage;
