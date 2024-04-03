export const Tabs = (props: { onClick: (val: string) => void }) => {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, val: string) => {
    e.preventDefault();
    props.onClick(val);
  };

  return (
    <ul className='flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200  flex-1'>
      <li className='me-2'>
        <a
          href='#'
          className='inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 '
          onClick={e => onClick(e, 'transfer')}
        >
          Transfer
        </a>
      </li>
      <li className='me-2'>
        <a
          href='#'
          className='inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 '
          onClick={e => onClick(e, 'dust-transfer')}
        >
          Dust Transfer
        </a>
      </li>
    </ul>
  );
};
