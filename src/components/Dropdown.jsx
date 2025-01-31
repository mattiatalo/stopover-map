/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useRef, useState } from 'react'
import useOnClickOutside from './useOutsideClick';

export default function Dropdown({ title, options, togglerCn, children}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useOnClickOutside(ref, () => {
        setIsOpen(false);
    });

    return (
        <div className='relative' ref={ref}>
            <button 
                id="dropdownDefaultButton" 
                onClick={() => setIsOpen(!isOpen)}
                className={togglerCn ? togglerCn : `text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center`} 
                type="button"
            >
               {title}
                <svg className="w-2.5 h-2.5 m-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                </svg>
            </button>

            { isOpen  ? <div id="dropdown"className="right-0 absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-48">
                <ul className="text-sm text-gray-700">
                    {children}
                </ul>
            </div> : ""}

        </div>
    )
}
