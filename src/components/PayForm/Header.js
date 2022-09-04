
const cssStyles = {
  navLink: 'block mx-4 text-lg font-normal text-gray-800 '+
    'hover:text-blue-800 cursor-pointer hover:underline',
};

function Header(props) {
  let tripId = props.tripId ?? '#';
  return (
    <div>
      <h1 className='text-gray-800 text-center text-3xl font-semibold pt-4'>
        <span className='font-extrabold text-blue-800 cursor-pointer'
          onClick={(_) => {window.location.assign('/');}}
          style={{fontFamily: "'Signika', sans-serif"}}
        >HoliPaycation</span> Form
      </h1>
      <div className='mt-4 flex justify-center'>
        <a className={cssStyles.navLink}
          href={'/'+tripId+'/records'}>Records</a>
        <a className={cssStyles.navLink}
          href={'/'+tripId+'/payments'}>Who Pays Who?</a>
      </div>
    </div>
  );
}

export default Header;
