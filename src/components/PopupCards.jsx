/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from "react";
import { useLocalization, useTranslation } from "./LocalizationProvider";

/* eslint-disable no-unused-vars */
let colors = {
    "stopover":"#991b1b",
    "persons":"orange",
    "documents":"#5F9EA0",
    "institutions":"grey",
    "scientific_specimen":"green"
}

const Card = ({ info, card, index, items,setActiveItem, setActiveTab, children, autoSlideInterval=300, autoSlide=false, setPopupInfo, setShowDetailTab }) => {
    const t = useTranslation();
    const { language } = useLocalization();
    const [curr, setCurr] = useState(index);

    const goToPrev = useCallback(() => setCurr((curr) => (curr === 0 ? children?.length - 1 : curr - 1)),[children]);
    const goToNext = useCallback(() => setCurr((curr) => (curr === children?.length - 1 ? 0 : curr + 1)),[children]);

    // console.log("Value", items[index]);
    useEffect(() => {
        if (!autoSlide) return
        const slideInterval = setInterval(goToNext, autoSlideInterval)
        return () => {
            clearInterval(slideInterval);
            setCurr(0);
        }
    }, [autoSlide, autoSlideInterval, goToNext])

    useEffect(() => {
        setCurr(index);
    }, [items, index]);

    const handleReadMoreClick = () => { 
        setPopupInfo(null); 
        setActiveItem({ info:items[curr], table:items[curr].category});

        // display detail tab
        if(items[curr].category == "stopover") {
            setShowDetailTab(true);
        }
        
        // console.log()
        setActiveTab(items[curr].category);
    };

    return ( 
    <div
        style={{ borderColor:colors[items[curr].category]}}
        className="border-2 border-[#FFA501] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between min-h-[200px] w-[300px] bg-white relative"
    > 
        <button className="absolute z-10 top-12 right-2 p-2 bg-gray-300 border rounded-full hidden">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <span className="absolute z-10 top-2 mt-[3px] right-8 mr-2 text-xs text-gray-900 flex items-center">
            <span 
                style={{ background: colors[items[curr].category]}} 
                className="mr-4 px-4 py-2 text-white font-bold rounded-2xl bg-red-800"
                // bg-red-800
            >
                {t(items[curr].category.split("_").join(" ") )}
            </span>
        </span>

                
        <div 
            className="overflow-hidden relative max-w-[350px] w-[300px]"
        >
            <div  
                style={{ transform: `translateX(-${curr * 300}px)` }} 
                className="flex transition-transform ease-out duration-500 w-auto max-h-auto"
            >
                {children}
            </div>
            
        </div>

        <div className="px-6 py-2 flex items-center justify-between bg-gray-200 w-full">
            <span className="py-1 text-xs text-gray-900 flex items-center cursor-pointer" onClick={handleReadMoreClick}>
                <span
                    className="mr-4 bg-gray-900 px-4 py-2 text-white border-none border-b-slate-950 rounded-2xl font-bold"
                >
                    {language == "it" ? "Dettagli" : "Read more" }
                </span>
            </span>

            { index + 1 == items.length ? "" : <span className="py-1 text-xs text-gray-900 flex items-center">
                <span className="flex space-x-2 mr-2">
                    <button className="p-2 bg-gray-300 rounded-full" onClick={goToPrev}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="p-2 bg-gray-300 rounded-full" onClick={goToNext}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </span>
                <span className="ml-1">{curr+1} / {items?.length}</span>
            </span> }
        </div>
    </div>
    )
}

const getPersonName = (info) => {
    if(info.category == "persons") {
        let personsName = "";
        personsName += info['LAST NAME'] == "N. A." ? "" : info['LAST NAME'];
        personsName += info['FIRST NAME'] == "N. A." ? "" : ", " + info['FIRST NAME'];

        return personsName
    } else {
        return "";
    }
}

const PersonCard = ({ info, handleImageClick }) => {
    const t = useTranslation();
    const {language} = useLocalization();
    const [imgErr, setImgErr] = useState("")


    const getValue = (colName) => {
        return info[ language == "it" ? `ITA_${colName}` : colName] || info[colName];
    }

    // console.log(info);
    return (    
        <div className="h-full min-w-[300px] w-full">
            <div className="w-full h-[200px] relative" style={{ background: (!info['IMAGE'] || imgErr) ? '#d3d3d3' : '#fff' }}>
                <a href="#">
                    {info['IMAGE'] && <img 
                        className={`w-full h-full object-cover ${imgErr ? 'hidden' : ""}`}
                        onError={() => setImgErr(true)}
                        src={info['IMAGE']}
                        onClick={(e) => { e.stopPropagation(); handleImageClick(info['IMAGE'])}}
                        alt="Sunset in the mountains" /> }
                    <div
                        onClick={(e) => { e.stopPropagation(); handleImageClick(info['IMAGE'])}}
                        className="hover:bg-gray-900 transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-transparent opacity-25">
                    </div>
                </a>
            </div>
            <div className="md:w-full flex flex-col justify-center mb-5 mt-3">
                <div className="px-6">
                    <a href="#"
                        className="mt-1 font-medium text-xl inline-block hover:text-red-900 transition duration-500 ease-in-out my-2">
                            {/* Bianchi, Carlos  */}
                            {getPersonName(info)}
                    </a>
                    <p className="text-gray-500 text-sm font-bold my-1">
                        {t('life dates')}: <span className="text-[#AD9A6D] font-bold">{getValue("LIFE DATES")}</span>
                    </p>

                    <hr className="border-gray-300 my-2" />

                    <p className="text-gray-500 text-sm font-bold my-1">
                        {t('country of birth')}: <span className="text-[#AD9A6D] ">{getValue('COUNTRY OF BIRTH')}</span>
                    </p>

                    <hr className="border-gray-300 my-2" />

                    <p className="text-gray-500 text-sm font-bold">
                        {t('occupation')}: <span className="text-[#AD9A6D] font-bold">{getValue('OCCUPATION')}</span>
                    </p>

                    <hr className="border-gray-300 my-2" />

                    <p className="text-gray-500 text-sm font-bold">
                        {t('encounter date')}: <span className="text-[#AD9A6D] font-bold">{getValue('ENCOUNTER DATE')}</span>
                    </p>
                </div>
            </div>
        </div>
            
    )
}

const DocumentCard = ({ info }) => {
    const t = useTranslation();
    const { language } = useLocalization();
    const [imgErr, setImgErr] = useState(false);

    const getValue = (colName) => {
        return info[ language == "it" ? `ITA_${colName}` : colName] || info[colName];
    }

    // console.log(info);
    return (
    <div className="h-full min-w-[300px] w-full">
        <div className="w-full h-[200px] relative" style={{ background: (!info['IMAGE'] || imgErr) ? '#d3d3d3' : '#fff' }}>
                <a href="#">
                    {info['IMAGE'] && <img className={`w-full h-full object-cover ${imgErr ? 'hidden' : ""}`}
                    onError={() => setImgErr(true)}
                    src={info['IMAGE']}
                    alt="Sunset in the mountains" />}
                <div
                    className="hover:bg-gray-900 transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-transparent opacity-25">
                </div>
            </a>
        </div>
        <div className="md:w-full flex flex-col justify-center mb-5 mt-3">
            <div className="px-6">
                <a href="#"
                    className="mt-1 font-medium text-xl inline-block hover:text-red-900 transition duration-500 ease-in-out my-2"
                >
                    {getValue("TITLE / NAME") }
                    {/* [Ludwig Christian]<br></br>Eduard von Laemmert */}
                </a>
                

                <p className=" text-sm font-bold my-1 text-[#5F9EA0]">{getValue('FIRST AUTHOR')}</p>
                <hr className="border-gray-300 my-2"/>
                <p className="text-gray-500 text-sm font-bold my-1">
                    {t('year/date')}: <span className="text-[#5F9EA0] ">{ getValue("YEAR  / DATE") }</span>
                </p>
                <hr className="border-gray-300 my-2" />
            </div>
        </div>
    </div>
    );
}

const SpecimenCard = ({ info, setShowSpline, setActiveItem }) => {
    const t = useTranslation();
    const { language } = useLocalization();
    const [imgErr, setImgErr] = useState(false);

    const getValue = (colName) => {
        return info[ language == "it" ? `ITA_${colName}` : colName] || info[colName];
    }

    const handleClick = (info) => {
        setActiveItem(info);
        setShowSpline(false);
    }

    const handleLoadErr = (e) => {
        console.log(e);

        setImgErr(true);
    }

    // console.log(info);

    return (
        <div className="h-full min-w-[300px] w-full">
            <div className="w-full h-[200px] relative" style={{ background: (!info['IMAGE'] || imgErr) ? '#d3d3d3' : '#fff' }}>
                <div href="#" className="h-full">
                    {
                        info['SPLINE-CODE'] && 
                        <div onClick={() => { console.log(info['SPLINE-CODE']); setShowSpline(info['SPLINE-CODE']) }} className="z-[30] cursor-pointer absolute bottom-2 right-2 w-16 h-16 bg-gray-100 border rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73zM16.5 9.4L7.5 4.21M3.27 6.96l8.73 5.04 8.73-5.04M12 22V12" />
                            </svg>
                        </div> 
                    }
              
                    {info['FEATURED IMAGE'] && <img className={`w-full h-full object-cover ${imgErr ? 'hidden' : ""}`}
                        onError={handleLoadErr}
                        src={info['FEATURED IMAGE']}
                        alt="Sunset in the mountains" /> }
                    <div
                        className="hover:bg-gray-900 transition duration-300 absolute bottom-0 top-0 right-0 z-8 left-0 bg-transparent opacity-25">
                    </div>
                </div>
                   
            </div>

                   <div className="md:w-full flex flex-col justify-center mb-5 mt-3">
                       <div className="px-6">
                           <a href="#"
                               className="mt-1 font-medium text-xl inline-block hover:text-red-900 transition duration-500 ease-in-out my-2"
                            >
                                {/* American Painted-snipe */}
                                {getValue('NAME')}
                            </a>
                           

                        <p className="text-gray-500 text-sm font-bold my-1 ">
                            {t('class') || 'Class'}: <span className="text-[#008000] ">{getValue('CLASS')}</span>
                        </p>
                        <hr className="border-gray-300 my-2"/>

                        <p className="text-gray-500 text-sm font-bold my-1">
                            {t('collection place') || 'Collection place'}: <span className="text-[#008000]  ">{getValue('COLLECTION PLACE')}</span>
                        </p>

                        <hr className="border-gray-300 my-2"/>

                           <p className="text-gray-500 text-sm font-bold my-1">
                            {t('collection date') || 'Collection date'}: <span className="text-[#008000]  ">{getValue('COLLECTION DATE')}</span>
                        </p>
                        <hr className="border-gray-300 my-2"/>


                       </div>
                   </div>
        </div>
    )
}


const InstitutionCard = ({info}) => {
    const t = useTranslation();
    const { language } = useLocalization();
    const [imgErr, setImgErr] = useState("")

    const getValue = (colName) => {
        return info[ language == "it" ? `ITA_${colName}` : colName] || info[colName];
    }
    return (
        <div className="h-full min-w-[300px] w-full">
                    <div className="w-full h-[200px] relative" style={{ background: (!info['IMAGE'] || imgErr) ? '#d3d3d3' : '#fff' }}>
                    <a href="#">
                            {info['IMAGE'] && <img className={`w-full h-full object-cover ${imgErr ? 'hidden' : ""}`}
                                onError={() => setImgErr(true)}
                                src={info['Image']}
                                alt="Sunset in the mountains" 
                                // onerror="this.style.display='none'; this.parentNode.style.backgroundColor='#d3d3d3';"
                            />}
                            <div
                                className="hover:bg-gray-900 transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-400 opacity-25 flex items-center justify-center"> 
                            </div>
                        </a>
                    </div>

                    <div className="md:w-full flex flex-col justify-center mb-5 mt-3">
                        <div className="px-6">
                            <a href="#"
                                className="mt-1 font-medium text-xl inline-block hover:text-red-900 transition duration-500 ease-in-out my-2">
                                    {getValue('INSTITUTION NAME')}
                                </a>
                          
                            
                            <p className="text-gray-500 text-sm font-bold my-1">
                                {t('foundation date')}: <span className="text-gray-900 ">{getValue('Foundation date')}</span>
                            </p>
                            <hr className="border-gray-300 my-2"/>
                            <p className="text-gray-500 text-sm font-bold my-1">
                                {t('director')}: <span className="text-gray-900 ">{getValue('Director')}</span>
                         </p>
                         <hr className="border-gray-300 my-2"/>
 
                            <p className="text-gray-500 text-sm font-bold my-1">
                                {t('typology')}: <span className="text-gray-900 ">{getValue('Typology')}</span>
                         </p>
                         <hr className="border-gray-300 my-2"/>
 
 
                        </div>
                    </div>
                </div>
    )
}

export { PersonCard, DocumentCard,  SpecimenCard, InstitutionCard, Card };