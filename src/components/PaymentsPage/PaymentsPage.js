import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

import styles from '../../styles/styles';
import Footer from '../Footer';

function PaymentsPage() {
  let { tripId } = useParams();
  let [emptyMsg, setEmptyMsg] = useState('Loading...');
  let [tripDetails, setTripDetails] = useState({
    loaded: false,
    trip_title: 'Loading...',
    currency: '$',
    members: [],
  });
  let [payments, setPayments] = useState([]);

  async function loadTripData() {
    if (tripDetails.loaded) return;
    let response = await fetch('/api/'+tripId+'/details', {method: 'GET'});
    let details = (await response.json())["details"];
    let tmp = Object.assign({}, tripDetails);
    tmp.loaded = true;
    tmp.trip_title = details.title;
    tmp.currency = details.currency;
    tmp.members = details.members;
    setTripDetails(tmp);
  }

  function loadPayments() {
    fetch('/api/'+tripId+'/payments', {
      method: 'GET',
    }).then((response) => {
      response.json().then((response) => {
        if (response.result !== 'success') {
          return;
        }
        setEmptyMsg('No payments required');
        setPayments(response.payments);
      });
    });
  }

  useEffect(() => {
    loadTripData();
    loadPayments();
  }, []);

  return (
<div className={styles.page}>
  <h1 className='text-blue-800 text-center text-3xl sm:text-5xl
                 font-extrabold pt-4 cursor-pointer'
    style={{fontFamily: "'Signika', sans-serif"}}
    onClick={() => {window.location.assign('/')}}
  >HoliPaycation</h1>

  <div className='mt-4 flex justify-center'>
    <a className={styles.form_nav_link}
      href={'/'+tripId}>Back to Form</a>
    <a className={styles.form_nav_link}
      href={'/'+tripId+'/records'}>Records</a>
  </div>

  <div className={styles.paper} style={{maxWidth: '48rem'}}>
    <h1 className='text-gray-600 text-center text-2xl font-semibold'>
      {tripDetails.trip_title}</h1>
    <h1 className='text-2xl text-gray-800 font-bold text-center'>
      Payments</h1>

    <div className='mt-8 px-6'>{
      payments.length > 0 ? payments.map((val, i) => {
        let nameStyle = 'mx-4 font-semibold text-2xl text-gray-800';
        return (
          <div key={'payment-item-'+i.toString()}
            className='my-4 px-8 py-4 shadow shadow-gray-500 rounded-lg'>
            <div className='flex justify-center items-center'>
              <span className={nameStyle}>{val.from}</span>
              <span className='text-lg text-gray-500'><FaArrowRight /></span>
              <span className={nameStyle}>{val.to}</span>
              <span className='ml-6 font-bold text-3xl text-blue-600'>
                {tripDetails.currency} {val.amount.toFixed(2)}
              </span>
            </div>
          </div>
        );
      }) : (
        <h1 className='text-lg text-gray-800 text-center'>{emptyMsg}</h1>
      )
    }</div>
  </div>
  <Footer />
</div>
  );
}

export default PaymentsPage;
