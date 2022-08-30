import { useParams } from "react-router-dom";
import Header from "./Header";

function PayFormSubmitted() {
  let { tripId } = useParams();

  let tripTitle = 'Title for ' + tripId;
  
  function submitForm() {
    let urlParams = window.location.href.split('?')[1];
    console.log(urlParams);
    fetch('/api/'+tripId+'/form-submit?'+urlParams, {
      method: 'POST',
    });
  }
  submitForm();

  return (
    <div className='min-h-screen min-w-full bg-gray-100'>
      <Header tripId={tripId} />
      <div className='p-8 m-6 bg-white rounded-2xl shadow shadow-slate-300'>
        <h1 className='text-gray-600 text-center text-2xl font-semibold'>
          {tripTitle}</h1>
        <h1 className='mt-4 text-gray-800 text-center text-xl'>
          Your entry has been inserted!
        </h1>
        <a className='block mx-auto mt-16 mb-2 px-4 py-2 text-white bg-blue-600
                      rounded-lg cursor-pointer hover:bg-blue-700
                      text-center text-lg font-normal
                     '
          href={'/'+tripId}
        >Submit another form</a>
      </div>
    </div>
  );
}

export default PayFormSubmitted;
