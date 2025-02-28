/* eslint-disable react/prop-types */
import { ChevronRight, ChevronsDown, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { useState } from 'react';
import classNames from 'classnames';

export default function CollapsibleTab(props) {
    const [isOpen, setIsOpen] = useState(false);

    const { position="top-right", collapseClass, collapseIcon } = props;

    // poistion of collapse toggle 
    let openClass = isOpen ? 'top-0 shadow-none mt-2 mr-2 w-[42px]':'top-0 w-[42px]';
    const togglerClass = classNames(
        'absolute shadow-md font-semibold text-sm cursor-pointer ',
        {
          'top-full right-0 mt-14': position === 'bottom-right',
          'top-0 left-0 mt-0 !mx-2': position === 'bottom-left',
          'right-0 my-1 mx-1': position === 'top-right',
        //   'left-0 mb-2': position === 'top-left',
        }
    );

    // const getIcon = () => {

    // }

    return (
        <div className={`collapse-tab  ${collapseClass} ${!isOpen ? '!w-[50px] !h-12 border-[0px] bg-[transparent] !shadow-none close' : "open"} z-[65]` }>
            <div className={`${togglerClass} ${openClass} group text-white right-0 zoom-in cursor-pointer rounded-full border-[#E9E4D8] border-[5px] mx-0 p-1 bg-[#AD9A6D]`} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? position.includes("left") ? <ChevronsLeft className='text-[#E9E4D8]' size={22} /> : <ChevronsRight className='text-[#E9E4D8]' size={22} />  : collapseIcon }

                {!isOpen && <div id="tooltip-default" role="tooltip" 
                    className={`absolute top-0 ${position.includes("left") ? 'left-10' : 'right-10' } max-w-40 w-36 z-[32] opacity-0 group-hover:opacity-100 inline-block px-3 py-2 text-sm font-medium text-black transition-opacity duration-300 bg-white rounded-lg shadow-xs  tooltip`}>
                    {props.tooltipTitle || "Tooltip content"}
                    <div className="tooltip-arrow" data-popper-arrow></div>
                </div> }
            </div>

            

            {isOpen && 
                props.children
           }
        </div>
    )
}
