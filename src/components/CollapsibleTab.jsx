/* eslint-disable react/prop-types */
import { ChevronsDown, X } from 'lucide-react';
import { useState } from 'react';
import classNames from 'classnames';

export default function CollapsibleTab(props) {
    const [isOpen, setIsOpen] = useState(true);

    const { position="top-right", collapseClass, collapseIcon } = props;

    // poistion of collapse toggle 
    let openClass = isOpen ? 'top-0 shadow-none mt-2 mr-2':'top-0';
    const togglerClass = classNames(
        'absolute shadow-md font-semibold text-sm cursor-pointer ',
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
        <div className={`collapse-tab ${collapseClass} ${!isOpen ? '!w-12 h-12 border-[0px] bg-[transparent] !shadow-none' : ""}` }>
            <div className={`${togglerClass} ${openClass} text-white zoom-in cursor-pointer rounded-full border-[#E9E4D8] border-[5px] mx-2 p-1 bg-[#AD9A6D]`} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className='text-[#E9E4D8]' size={22} /> : collapseIcon }
            </div>

            {isOpen && 
                props.children
           }
        </div>
    )
}
