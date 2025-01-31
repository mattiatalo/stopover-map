/* eslint-disable react/prop-types */
import { ShieldCloseIcon, X } from 'lucide-react'
import { useState, useRef } from 'react'
import useOnClickOutside from './useOutsideClick';

// import { useTranslation } "./LocalizationProvider";
import { useLocalization, useTranslation } from '../components/LocalizationProvider';


export default function Modal(props) {
    const [isOpen, setIsOpen] = useState(props.isOpen);
    const [activeTab, setActiveTab] = useState("table");
    const t = useTranslation();

    const ref = useRef(null);

    const handleClick = () => {
        // setIsOpen(false);
        props.toggleActiveTable(null);
    }

    useOnClickOutside(ref, () => {
        console.log("Click");
        handleClick();
    })

    return (
    <div 
        id="static-modal" 
        data-modal-backdrop="static" tabIndex="-1" aria-hidden="true"
        className={`${isOpen ? '' : 'hidden'} overflow-y-auto overflow-x-hidden  bg-black/60 fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100vh-1rem)] max-h-full`}
    >
        <div className="relative p-4 w-full max-w-[80%] max-h-full mx-auto top-10">
        
            <div className="relative bg-white rounded-lg shadow da:bg-gray-700" ref={ref}>
                
                <div className="flex items-center justify-between p-2 border-b rounded-t da:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-900 da:text-white capitalize">
                        {t(props.activeTab.split("_").join(" ")) || props.activeTab.split("_").join(" ")}
                    </h3>
                    
                    <button type="button" onClick={handleClick} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center da:hover:bg-gray-600 da:hover:text-white" data-modal-hide="static-modal">
                        <X />
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                
                <div className="space-y-4 h-[80vh] w-full overflow-auto">
                    {/* <p className="text-base leading-relaxed text-gray-500 da:text-gray-400">
                        With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.
                    </p>
                    <p className="text-base leading-relaxed text-gray-500 da:text-gray-400">
                        The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to notify users as soon as possible of high-risk data breaches that could personally affect them.
                    </p> */}

                    {props.children}
                </div>
                
                
            </div>
        </div>
    </div>
  )
}
