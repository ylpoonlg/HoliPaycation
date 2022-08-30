import { useParams } from "react-router-dom";

function PayFormSubmitted() {
  let { tripId } = useParams();
  
  function submitForm() {
    let urlParams = window.location.href.split('?')[1];
    console.log(urlParams);
    fetch('/api/'+tripId+'/form-submit?'+urlParams);
  }
  submitForm();

  return (
    <div className='min-h-screen min-w-full bg-gray-100'>
      <h1 className='text-gray-800 text-center text-3xl font-semibold pt-4'>
        <span className='font-extrabold text-blue-800'>GoPaycation</span> Form
      </h1>
      <div className='p-8 m-6 bg-white rounded-2xl shadow shadow-slate-300'>
        <h1 className='text-gray-600 text-center text-2xl font-semibold'>
          Your entry has been inserted!
        </h1>
        <a className='block mx-auto my-6 px-4 py-2 text-white bg-blue-600
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
