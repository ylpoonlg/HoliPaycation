import { useState } from 'react';
import { BsShare, BsClipboard, BsCheck, BsLink } from 'react-icons/bs';
import Footer from '../Footer';

function TripCreatedPage(props) {
  let tripId = props.tripId;

  let [tidCopyBtn, setTidCopyBtn] = useState((<BsClipboard />));
  let [linkCopyBtn, setLinkCopyBtn] = useState((<BsLink />));
  
  function onCopyTripId(_) {
    navigator.clipboard.writeText(tripId).then();
    setTidCopyBtn((<BsCheck />));
    setTimeout(() => {
      setTidCopyBtn((<BsClipboard />));
    }, 3000);
  }

  function onCopyFormLink() {
    navigator.clipboard.writeText(window.location.origin + "/" + tripId).then();
    setLinkCopyBtn((<BsCheck />));
    setTimeout(() => {
      setLinkCopyBtn((<BsLink />));
    }, 3000);
  } 

  return (
    <div className='min-h-screen min-w-full bg-gray-100'>
      <h1 className='text-blue-800 text-center text-3xl sm:text-5xl
                     font-extrabold pt-4 cursor-pointer
                    '
        style={{fontFamily: "'Signika', sans-serif"}}
        onClick={() => {window.location.assign('/')}}
      >
        GoPaycation
      </h1>
      
      <div className='px-8'>
        <h1 className='text-gray-800 text-center text-3xl font-semibold pt-8'>
          Trip successfully created!
        </h1>
        <h1 className='text-gray-600 text-center text-xl font-normal pt-8'>
          Your trip id is:
        </h1>
        <div className='relative max-w-sm mx-auto mt-6 p-4
                        border-8 border-blue-600 rounded-xl
                       '>
          <h1 className='text-blue-800 text-center text-3xl sm:text-5xl font-bold'>
            {tripId}
          </h1>
          <button className='absolute right-4 top-6 text-2xl text-gray-500 hover:text-black'
            title='Copy trip id to clipboard'
            onClick={onCopyTripId}>{tidCopyBtn}</button>
        </div>

        <div className={'mt-6 flex justify-center items-center'}>
          <button className='w-8 h-8 rounded-full text-xl mr-3
                             text-gray-600 hover:text-gray-800
                            ' title='Copy link to clipboard'
            onClick={onCopyFormLink}
          >{linkCopyBtn}</button>
          <div>
            <a className='text-lg text-blue-800 hover:text-purple-900 underline' href={'/' + tripId}>
              {window.location.origin + '/' + tripId}
            </a>
            <p className='text-gray-600 text-md'>Share this link with other members</p>
          </div>
        </div>

        <div className='flex justify-center items-center mt-10'>
          <button className='max-w-sm w-full mx-6 px-8 py-2 rounded-2xl
                             text-white bg-blue-600 shadow shadow-gray-500
                             hover:bg-blue-700 hover:shadow-black
                            ' title='Fill out a form'
            onClick={(_) => {window.location.replace('/' + tripId);}}
          >Go to form</button>
        </div>

        <p className='mt-8 text-center text-2xl text-gray-800 font-semibold'>
          Enjoy and have a safe trip!
        </p>
      </div>
      <Footer />
    </div>
  );
}

export default TripCreatedPage;
