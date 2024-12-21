/* eslint-disable react/prop-types */
import { ChevronsDown } from 'lucide-react';
import { useState } from 'react';
import classNames from 'classnames';

export default function CollapsibleTab(props) {
    const [isOpen, setIsOpen] = useState(true);

    const { position="top-right", collapseClass, collapseIcon } = props;

    // poistion of collapse toggle 
    let openClass = isOpen ? 'top-0 shadow-none bg-transparent bg-white/0':'top-0 bg-white';
    const togglerClass = classNames(
        'absolute shadow-md font-semibold text-gray-700 px-2 py-2 rounded-md text-sm cursor-pointer',
        {
          'top-full right-0 mt-14': position === 'bottom-right',
          'top-full left-0 mt-14': position === 'bottom-left',
          'right-0 mb-2': position === 'top-right',
          'left-0 mb-2': position === 'top-left',
        }
    );

    // const getIcon = () => {

    // }

    return (
        <div className={collapseClass}>
            <div className={`${togglerClass} ${openClass}`} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <ChevronsDown className='text-gray-600'/> : collapseIcon }
            </div>

            {isOpen && 
                props.children
           }
        </div>
    )
}
