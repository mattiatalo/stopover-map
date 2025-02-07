/* eslint-disable react/prop-types */
import { X } from 'lucide-react';
import {useState} from 'react'

export default function ImageViewer(props) {
    const [showModal, setShowModal] = useState(props.showImage ? false : true);

    return (
        <div className='w-full relative overflow-hidden rounded-[10px]'>
            { props.showImage ? <img src={props.imageUrl} className={props.className + ` h-auto w-full rounded-[10px] ${props.cnName}`} onClick={() => setShowModal(true)}/> : ""}
            <div 
                id="static-modal" 
                data-modal-backdrop="static" 
                className={`${showModal ? '' : 'hidden'} overflow-y-auto overflow-x-hidden bg-black/90 fixed top-0 right-0 left-0 z-[60] justify-center items-center w-full md:inset-0 h-[calc(100vh-0rem)] max-h-full`}
            >
                <button type="button" 
                    onClick={() => {setShowModal(false); props.onClose()}} 
                    className=" absolute right-6 top-6 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dak:hover:bg-gray-600 dak:hover:text-white" data-modal-hide="static-modal">
                    <X size={32}/>
                    <span className="sr-only">Close modal</span>
                </button>

                <div className="relative p-2 w-auto top-16 flex items-center justify-center">
                    <img src={props.imageUrl} className={`h-auto max-h-[80vh] w-auto`} />
                </div>
            </div>
        </div>
    )
}

// Novara circumnvigation..... > Circumnavigazione
// Commodore..... > Commodoro Wüllerstorf e ufficiali a Canton
// Novara naturalistic in Macao > Gli scienziati a Macao
// Hochstetter..... > Missione di Hochstetter in Nuova Zelanda (dates....)
// Hochstetter's return voyage (2/10/1859-9/01/1860)


// in ita 
//  Viaggio di ritorno di Hochstetter
// (2/10/1859-9/01/1860)
// Viaggio di ritorno di Hochstetter (2/10/1859-9/01/1860)
// Schernzer.... > Viaggio di ritorno di Scherzer

// Search Stopover > Cerca la tappa
