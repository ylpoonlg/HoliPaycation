import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

import styles from '../../styles/styles';
import Header from './Header';
import Footer from '../Footer';
import '../../styles/style.css';

const cssStyles = {
  inputTitle: 'text-xl text-blue-900 font-semibold',
  inputField: 'my-2 px-2 py-1 w-full border-2 border-blue-400 rounded-lg text-gray-800',
  dropdownItem: 'px-4 py-1 hover:bg-gray-200 cursor-pointer',
};

function PayForm() {
  let { tripId } = useParams();
  let [amtTotal, setAmtTotal] = useState(true);
  let [paid, setPaid]         = useState('');
  let [payers, setPayers]     = useState([]);

  let [tripDetails, setTripDetails] = useState({
    loaded: false,
    trip_title: 'Loading...',
    members: [],
  });

  async function loadTripData() {
    if (tripDetails.loaded) return;

    let response = await fetch('/api/'+tripId+'/details', {
      method: 'GET',
    });

    let details = (await response.json())["details"];
    let tmp = Object.assign({}, tripDetails);
    tmp.loaded = true;
    tmp.trip_title = details.title;
    tmp.members = details.members;
    setTripDetails(tmp);
  }

  useEffect(() => {
    loadTripData();
  }, []);

  return (
    <div className={styles.page}>
      <Header tripId={tripId} />
      <div className={styles.paper}>
        <h1 className='text-gray-600 text-center text-2xl font-semibold'>
          {tripDetails.trip_title}</h1>

        {/* Input Sections */}
        <form action={'/'+tripId+'/submitted'}>
          <div className='mt-4'>
            <p className={cssStyles.inputTitle}>Item</p>
            <input name='item_title' type='text' placeholder='e.g. Lunch, Supermarket, Train, etc.'
              className={cssStyles.inputField} required="required" />
          </div>
          <div className='mt-4'>
            <p className={cssStyles.inputTitle}>Amount</p>
            <div className='flex'>
              <input name='amount' type='number' step={0.01} className={cssStyles.inputField}
                defaultValue={0} min={0} required="required" />
              <div className='pl-6 flex align-middle'>
                <input type='checkbox' name='total'
                  checked={amtTotal} value='true'
                  className='hidden' onChange={() => {}} />
                <PayFormCheckbox checked={amtTotal}
                  onChange={(val) => {
                    setAmtTotal(val);
                  }} />

                <p className={cssStyles.inputTitle +
                  ' pt-3 pl-4 align-middle cursor-help'}
                  title='Automatically divide amount to each of the payers if checked'
                >Total</p>
              </div>
            </div>
          </div>
          <div className='mt-4'>
            <p className={cssStyles.inputTitle}>Who Paid</p>
            <input name='paid' type='text' className='hidden' value={paid} onChange={() => {}} required="required" />
            <PayFormDropdown value={paid} placeholder='-- Select Paid Person --' options={tripDetails.members} onChange={(val) => {
              setPaid(val);
            }} />
          </div>

          <div className='mt-4'>
            <p className={cssStyles.inputTitle}>Payers</p>
            <input name='payers' type='text' className='hidden' value={payers} onChange={() => {}} />
            <div className='mt-2'>
              {tripDetails.members.map(e => (
                <div key={e + '-item'}>
                  <div className={'flex justify-start py-2 my-1 rounded-lg '+
                      'hover:bg-gray-200 cursor-pointer '+
                      (payers.includes(e) ? 'bg-blue-200 hover:bg-blue-300 ' : ' ')
                  } onClick={(_) => {
                    let tmp = payers.slice();
                    if (tmp.includes(e)) {
                      tmp.splice(tmp.indexOf(e), 1);
                    } else {
                      tmp.push(e);
                    }
                    setPayers(tmp);
                  }}>
                    <div className={'mx-4 my-auto w-4 h-4 rounded-full border-2 ' +
                      (payers.includes(e) ? 'bg-blue-600 border-white ' : 'bg-white border-blue-400 ')}></div>
                    <span>{e}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className='mt-10'>
            <input type='submit' className='px-4 py-2 w-full
                                            bg-blue-600 text-white
                                            hover:bg-blue-700
                                            rounded-lg cursor-pointer'
              onClick={() => {
                if (paid === '') {
                  alert('Please select a person who paid.');
                  return false;
                }
              }}
              value={'Add'} />
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default PayForm;

function PayFormCheckbox(props) {
  let checked = props.checked ?? false;
  let onChange = props.onChange ?? (() => {});

  let [isChecked, setIsChecked] = useState(checked);

  return (
      <div type='checkbox' value={checked ? 'true' : 'false'}
        onClick={(_) => {
          onChange(!isChecked);
          setIsChecked(!isChecked);
        }}
        className={'mt-3 h-6 w-6 cursor-pointer '+
        'appearance-none border border-1 rounded-md '+
        (isChecked ? 'bg-blue-600 border-blue-600 ' : 'bg-white border-gray-600 ')
        }>
        <div className='m-auto w-2 h-5 rotate-45 border-0
                        border-r-2 border-b-2 border-white'></div>
      </div>
  );
}

function PayFormDropdown(props) {
  let value = props.value ?? '';
  let onChange = props.onChange ?? (() => {});
  let options = props.options ?? [];
  let placeholder = props.placeholder ?? '-- Select --';

  let [isShown, setIsShown] = useState(false);
  return (
    <div className='relative'>
      <div className={cssStyles.inputField + ' flex justify-between cursor-pointer'}
        onClick={(_) => {
          setIsShown(!isShown);
        }}>
        <span>{value=='' ? placeholder : value}</span>
        <span className='my-auto'>{isShown ? <FaAngleUp /> : <FaAngleDown />}</span>
      </div>
      <div className={'absolute w-full top-full overflow-hidden ' +
                      'bg-white border-2 border-gray-400 rounded-md ' +
                      'shadow shadow-gray-500 ' +
                      (isShown ? '' : 'hidden')
                     }>
        {options.map(e => (
          <div key={e + '-dropdownItem'}
            className={cssStyles.dropdownItem} onClick={() => {
              onChange(e);
              setIsShown(false);
            }}>
            <p>{e}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
