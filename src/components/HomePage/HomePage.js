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
    <div className='min-h-screen min-w-full bg-gray-100'>
      <h1 className='text-gray-800 text-center text-5xl font-semibold pt-4'>
        Welcome to 
        <span className='font-extrabold text-blue-800'
          style={{fontFamily: "'Signika', sans-serif"}}
        > GoPaycation</span>!
      </h1>

      <div className='mt-16'>
        <button className='block text-4xl mx-auto px-12 py-2
                           text-white bg-blue-400 hover:bg-blue-500 rounded-3xl
                           shadow-md shadow-blue-200
                          '>
          Create a Trip
        </button>
      </div>
      <div className='my-8 text-center text-2xl'>
        <span>or</span>
      </div>
      <div className='mb-8'>
        <div className='text-center'>
          <label htmlFor='trip-id'
            className='mx-4 text-blue-900 text-2xl font-semibold'
          >Join A Trip</label>
          <input name='trip-id' type='text' placeholder='Enter Trip ID'
            className='px-2 py-1 w-64 rounded-lg border-2 border-blue-400'
            onChange={(e) => {tripID = e.target.value;}}
          />
          <button className='px-4 py-1 text-white bg-blue-600 hover:bg-blue-700
                             mx-4 rounded-xl
                            ' onClick={onJoinTrip}>
            Fill a form!</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
