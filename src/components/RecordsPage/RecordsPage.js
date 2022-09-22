import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../styles/styles';
import Footer from '../Footer';

import './records-styles.css';

function RecordsPage() {
  let { tripId } = useParams();
  let [emptyMsg, setEmptyMsg] = useState('Loading...');
  let [tripDetails, setTripDetails] = useState({
    loaded: false,
    trip_title: 'Loading...',
    currency: '$',
    members: [],
  });
  let [records, setRecords] = useState([]);

  useEffect(() => {
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

    function loadRecords() {
      fetch('/api/'+tripId+'/records', {
        method: 'GET',
      }).then((response) => {
        response.json().then((response) => {
          if (response.result !== 'success') {
            return;
          }

          let tmp = [];
          response.records.forEach((rec) => {
            let amountPp = rec.amount;
            if (rec.total) {
              amountPp /= rec.payers.length;
            }
            tmp.push({
              timestamp: new Date(rec.timestamp),
              item: rec.item,
              amount: amountPp,
              paid: rec.paid,
              payers: rec.payers,
            });
          });
          setEmptyMsg('No records found');
          setRecords(tmp);
        });
      });
    }

    loadTripData();
    loadRecords();
  }, []);

  function formatDateTime(dt) {
    function leadZeros(x, n) {
      let s = "000000000" + x.toString();
      return s.substring(s.length-n);
    }
    let DD = leadZeros(dt.getDate(), 2);
    let MM = leadZeros(dt.getMonth(), 2);
    let YYYY = leadZeros(dt.getFullYear(), 4);
    let hh = leadZeros(dt.getHours(), 2);
    let mm = leadZeros(dt.getMinutes(), 2);
    return `${DD}-${MM}-${YYYY}`
      + ` ${hh}:${mm}`;
  }

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
      href={'/'+tripId+'/payments'}>Who Pays Who?</a>
  </div>

  <div className={styles.paper} style={{maxWidth: '48rem'}}>
    <h1 className='text-gray-600 text-center text-2xl font-semibold'>
      {tripDetails.trip_title}</h1>
    <h1 className='text-2xl text-gray-800 font-bold text-center'>
      Records</h1>

    <div className='mt-4 rounded-lg shadow shadow-gray-200 overflow-auto'>
      <table className='records table-auto w-full bg-gray-100 border-collapse'>
        <thead className='bg-blue-600'>
          <tr className='text-left'>
            <th>Timestamp</th>
            <th>Item</th>
            <th>Amount <span className='text-xs'>(pp)</span></th>
            <th>Paid by</th>
            <th>Payers</th>
          </tr>
        </thead>
        <tbody>
          {(records.length == 0) ? (
            <tr>
              <td colSpan={5} className='text-center'>{emptyMsg}</td>
            </tr>
          ) : null}
          {records.map((val, i) => {
            let cellStyle = 'px-2';
            let rowStyle = (i%2 == 0) ? 'bg-gray-50' : 'bg-gray-100';
            return (
            <tr key={i.toString() + '-record-row'} className={rowStyle}>
              <td className={cellStyle}>
                <span title={val.timestamp.toString()}>{formatDateTime(val.timestamp)}</span>
              </td>
              <td className={cellStyle}>{val.item}</td>
              <td className={cellStyle}>{tripDetails.currency} {val.amount.toFixed(2)}</td>
              <td className={cellStyle}>{val.paid}</td>
              <td className={cellStyle}>{val.payers.join(',')}</td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
  <Footer />
</div>
  );
}

export default RecordsPage;
