import Footer from "../Footer";

const styles = {
  introHeader: 'mt-6 text-blue-600 text-2xl font-semibold',
  introBody:   'mt-4 text-gray-700 text-xl',
};

function HomePage() {
  let tripID = '';

  async function onJoinTrip() {
    //console.log('Joining trip: ' + tripID);
    if (tripID === '') {
      alert('Please enter a valid trip id.');
      return;
    }

    let response = await fetch('/api/'+tripID+'/details', {method: 'GET'});
    response = await response.json();
    console.log(response);
    if (response.result === 'not_found') {
      alert('Trip Id does not exist. Please make sure you have entered the id correctly.');
      return;
    } else if (response.result === 'success') {
      window.location.assign('/' + tripID);
    }
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

      <div className='w-full m-auto mt-24 px-6 pb-36'>
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
      <div className='py-8 pb-16 text-center bg-gray-200'>
        <h1 className='text-blue-800 text-4xl font-semibold'>Introduction</h1>
        <p className={styles.introBody}>
          HoliPaycation is a website for calculating shared expenses during holidays
        </p>

        <h1 className={styles.introHeader}>How to use it?</h1>
        <ol className={styles.introBody + ' text-left max-w-xl m-auto px-8 list-decimal'} type='I'>
          <li>Create a trip by clicking the button above.</li>
          <li>Copy the trip id or form url and write it down in a secure place.</li>
          <li>Share the link to other members of the trip.</li>
          <li>Go to the entry form using the link copied earlier or enter the trip id to join the trip.</li>
        </ol>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;
