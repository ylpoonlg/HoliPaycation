import { useState } from 'react';
import { BsPlusCircle, BsX } from 'react-icons/bs';
import Footer from '../Footer';

import TripCreatedPage from './TripCreatedPage';

const cssStyles = {
  inputTitle: 'text-xl text-blue-900 font-semibold',
  inputField: 'my-2 px-2 py-1 w-full border-2 border-blue-400 rounded-lg text-gray-800',
  dropdownItem: 'px-4 py-1 hover:bg-gray-200 cursor-pointer',
};

function CreateTripForm(props) {
  let [title,      setTitle]     = useState('');
  let [currency,   setCurrency]  = useState('');
  let [members,    setMembers]   = useState(['']);
  let [phMembers,  setPhMembers] = useState([getRandomName()]);

  function getRandomName() {
    const NAMES = [
      "John","Mary","Peter","David","Jane","Andy","Chris","Leo",
      "Sarah","Jessie","Liam","Polly","Tommy","Sammy","Jim","Tim",
      "Ben","Ken","Lois","Anna","Zak","Jason","Nathan","Ryan",
      "Gohan","Mochi","Sakura","Max",
    ];
    return NAMES[Math.floor(Math.random() * NAMES.length)];
  }
  function onAddMember(_) {
    let tmp = members.slice();
    tmp.push('');
    setMembers(tmp);

    tmp = phMembers.slice();
    tmp.push(getRandomName());
    setPhMembers(tmp);
  }
  function onDeleteMember(i) {
    if (members.length <= 1) {
      alert('A trip is not a trip without anyone going...\nPlease leave at least one member.');
      return;
    }
    let tmp = members.slice();
    tmp.splice(i, 1);
    setMembers(tmp);

    tmp = phMembers.slice();
    tmp.splice(i, 1);
    setPhMembers(tmp);
  }

  function onCreateTrip(_) {
    // Validation
    if (title === '') {
      alert('Please enter a title for the trip.');
      return;
    }
    if (currency.length != 3) {
      alert('Please enter the 3-character currency code.');
      return;
    }
    if (members.includes('')) {
      alert('Please give each member a name.');
      return;
    }


    let url = new URL(window.location.origin + '/api/create-trip');
    url.searchParams.append('trip_title', title);
    url.searchParams.append('currency', currency);
    url.searchParams.append('members', members);
    fetch(url.toString(), {
      method: 'POST',
    }).then((response) => {
      if (response.ok) {
        response.json().then(
          (response) => {
            console.log(response);
            if (response.result === 'success') {
              props.onCreated(response.trip_id);
            }
          }
        );
      }
    });
  }

  return (
    <div className='min-h-screen min-w-full bg-gray-100'>
      <h1 className='text-blue-800 text-center text-3xl sm:text-5xl
                     font-extrabold pt-4 cursor-pointer
                    '
        style={{fontFamily: "'Signika', sans-serif"}}
        onClick={() => {window.location.assign('/')}}
      >
        HoliPaycation
      </h1>
      <h1 className='text-gray-800 text-center text-3xl font-semibold pt-8'>
        Create a New Trip!
      </h1>

      <div className='max-w-2xl mx-auto mt-6 pb-24 px-8'>
        <div className='mt-4'>
          <p className={cssStyles.inputTitle}>Title</p>
          <input name='title' type='text'
            value={title} onChange={(e) => {
              setTitle(e.target.value);
            }}
            placeholder='Where are you going?'
            className={cssStyles.inputField} required="required" />
        </div>

        <div className='mt-4'>
          <p className={cssStyles.inputTitle}>Currency</p>
          <span className='ml-4 text-sm text-gray-400 font-normal'>
            Just to make sure everyone agrees to use the same currency
          </span>
          <input name='currency' type={'text'} maxLength='3' minLength='3'
            value={currency} onChange={(e) => {
              setCurrency(e.target.value);
            }}
            placeholder='e.g. GBP, USD, HKD, EUR'
            className={cssStyles.inputField} required="required" />
        </div>

        <div className='mt-4'>
          <p className={cssStyles.inputTitle}>Members</p>
          <div className='mt-2'>
            {members.map((val, i) => (
              <div key={i.toString() + '-item'}
                className='bg-white px-4 py-2 my-1 rounded-lg'>
                <div className='flex justify-between items-center'>
                  <div className='block text-2xl' style={{minWidth: '2rem'}}>{i + 1}</div>
                  <input type='text' placeholder={phMembers[i]}
                    value={val} onChange={(e) => {
                      let tmp = members.slice();
                      tmp[i] = e.target.value;
                      setMembers(tmp);
                    }}
                    className={cssStyles.inputField+' '} />
                  <button title='Delete this member'
                    className='ml-4 text-gray-600 hover:text-gray-800 text-2xl'
                    onClick={(_) => {
                      onDeleteMember(i);
                    }}
                  ><BsX /></button>
                </div>
              </div>
            ))}
            <button className='block hover:bg-blue-200 px-4 py-2 my-3 rounded-lg w-full
                               text-2xl text-blue-600 hover:text-blue-800 text-center
                               hover:shadow-slate-400 hover:shadow'
              title='Add a member' onClick={onAddMember}>
              <BsPlusCircle className='mx-auto' />
            </button>
          </div>
        </div>
        

        <div className='mt-6'>
          <button className='w-full py-2 rounded-2xl mt-2
                             text-white bg-blue-600 shadow shadow-gray-500
                             hover:bg-blue-700 hover:shadow-black
                            '
            onClick={onCreateTrip}
          >Let's GO!!!</button>
        </div>

        <div className='mt-8'>
          <p className='text-sm text-gray-600 text-center'>
            <span className='font-semibold'>Data Usage and Terms:</span><br/>
            Trips that are not accessed for more than 30 days may be removed automatically.<br/>
            By entering the form, you agree to share your data to our site, which may be accessed publicly.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}



function CreateTripPage() {
  let [isCreated, setIsCreated] = useState(false);
  let [tripId, setTripId] = useState('');

  return isCreated
    ? (<TripCreatedPage tripId={tripId} />)
    : (<CreateTripForm onCreated={(trip_id) => {
        setTripId(trip_id);
        setIsCreated(true);
      }} />);
}

export default CreateTripPage;
