import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "./Header";

function PayFormSubmitted(props) {
  let { tripId } = useParams();
  let [submitted, setSubmitted] = useState(false);
  let [resultText, setResultText] = useState('Please wait...');

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
  
  function submitForm() {
    let urlParams = window.location.href.split('?')[1];
    let params = new URLSearchParams(urlParams);

    if (params.has('submitted')) {
      setSubmitted(true);
      setResultText('Your form has been submitted!');
      return;
    }

    fetch('/api/'+tripId+'/form-submit?'+urlParams, {
      method: 'POST',
    }).then((response) => {
      if (response.ok) {
        response.json().then((json) => {
          if (json.result === 'success') {
            let newUrl = new URL(window.location.href);
            newUrl.searchParams.append('submitted', true);
            window.location.replace(newUrl);
          } else {
            setSubmitted(true);
            setResultText(json.msg ?? 'Failed to submit form.');
          }
        });
      } else {
        setSubmitted(true);
        setResultText('Sorry, something went wrong :(');
      }
    });
  }

  window.onload = () => {
    submitForm();
    loadTripData();
  }

  return (
    <div className='min-h-screen min-w-full px-4 bg-gray-100'>
      <Header tripId={tripId} />
      <div className='max-w-lg p-8 mx-auto mt-6 bg-white rounded-2xl shadow shadow-slate-300'>
        <h1 className='text-gray-600 text-center text-2xl font-semibold'>
          {tripDetails.trip_title}</h1>
        <h1 className='mt-4 text-gray-800 text-center text-xl'>
          {resultText}
        </h1>
        <a className={'block mx-auto mt-16 mb-2 px-4 py-2 text-white bg-blue-600\
                      rounded-lg cursor-pointer hover:bg-blue-700\
                      text-center text-lg font-normal'+
                      (submitted ? ' ' : ' hidden')}
          href={'/'+tripId}
        >Submit another form</a>
      </div>
    </div>
  );
}

export default PayFormSubmitted;
