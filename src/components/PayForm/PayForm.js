import { useParams } from 'react-router-dom';
import '../../styles/style.css';

const cssStyles = {
  inputTitle: 'text-xl text-blue-900 font-semibold',
  inputField: 'my-2 px-2 py-1 w-full border-2 border-blue-400 rounded-lg text-gray-800',
};

//<div className=''>Tailwind Test</div>

function PayForm() {
  let { tripId } = useParams();
  let tripTitle = 'Salmonegian Trip';
  return (
    <div className='min-h-screen min-w-full bg-gray-100'>
      <h1 className='text-gray-800 text-center text-3xl font-semibold pt-4'>
        <span className='font-extrabold text-blue-800'>GoPaycation</span> Entry Form
      </h1>
      <div className='p-8 m-6 bg-white rounded-2xl shadow-slate-300'>
        <h1 className='text-gray-600 text-center text-2xl font-semibold
                      '>{tripTitle}</h1>
        <div className='mt-4'>
          <p className={cssStyles.inputTitle}>Item</p>
          <input className={cssStyles.inputField} />
        </div>
      </div>
    </div>
  );
}

export default PayForm;
