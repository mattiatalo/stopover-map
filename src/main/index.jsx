/* eslint-disable react/prop-types */
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import MainLayout from './MainLayout';
import MainMap from './MainMap';
import { getData, loadPageIntroSections } from '../services/data';
import CollapsibleTab from '../components/CollapsibleTab';
import { Bird, ChevronDown, ChevronsLeft, ChevronsRight, ChevronUp, CircleDot, File, Files,  MapPin, School, Users, X } from 'lucide-react';

// import { Novara } from "./data";
import {Route  as Novara} from "./route";
import { columnNames, VoyageColors } from "../components/constants";

// import RangeSlider from 'react-range-slider-input';
// import 'react-range-slider-input/dist/style.css';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { Layer, Marker, Popup, Source } from 'react-map-gl';
import { useDebounce } from 'use-debounce';
import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat";
import Grid from '../components/Grid';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { useLocalization, useTranslation } from '../components/LocalizationProvider';
import ImageViewer from '../components/ImageViewer';
import { RiArrowDownSLine, RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import Charts from './charts';
import { DocumentsDiv, InstitutionDiv, PersonsDiv, StopOverDiv } from '../components/InfoDivs';
import { Parser } from 'html-to-react';
import { Card, DocumentCard, InstitutionCard, PersonCard, SpecimenCard } from '../components/PopupCards';

import useOnClickOutside from '../components/useOutsideClick';
import {isMobile} from 'react-device-detect';


dayjs.extend(customParseFormat);

const marks = {
    0:1857,
    24:1858,
    48:1859,
}

const sliderValuesToDates = (values) => {
    let [min, max] = values;
    let minYear = 1857;

    let date = new Date(`${minYear}`).valueOf();
    // console.log(date);
    let minDate = new Date(date + 1317600000 * min);
    let maxDate = new Date(date + 1317600000 * max);


    return [minDate, maxDate]
}

const voyageColorCards = VoyageColors;
// {
//     "Whole circumnavigation":'#991b1b',
//     "Commodore Wüllerstorf-Urbair and staff in Canton":'#95E2AA',
//     "Novara naturalists in Macao":'#E761D2',
//     "Hochstetter's New Zealand mission (8/01-2/10/1859)":"#548EB6",
//     "Hochstetter's return journey (2/10/1859-9/01/1860)" : "#7F3BC4",
//     "Scherzer's return journey (16/05-1/08/1859)":"#C49AC4"
// };

const htmlToReactParser = new Parser();

export default function MainPage() {
    const [isLoaded, setIsLoadied] = useState(false)
    const [ activeStopOver, setActiveStopOver ] = useState(null);
    const [ activeTab, setActiveTab] = useState(null);
    const [ activeView, setActiveView] = useState("table");
    const [ hoverItem, setHoverItem] = useState(null);
    const [ activeItem, setActiveItem] = useState(null);

    const [ isLayerTabOpen, setLayerTabOpen] = useState(false);
    const [ activeLayers, setActiveLayers ] = useState(["institutions", "persons", "scientific_specimen", "documents"]);
    const [ activeImage, setActiveImage] = useState(null);

    const [ activeTable, setActiveTable ] = useState(null);
    const [ isSummaryClick, setIsSummaryClick] = useState(false);
    const [ activeLink, setActiveLink] = useState("");
    const [ downloadProgress, setDownloadProgress] = useState(0);
    const [ isDataLoading, setIsDataLoading ] = useState(false);
    const [ showSpline, setShowSpline] = useState(false);
    const [ popupInfo, setPopupInfo ] = useState(null);
    const [showDetailTab, setShowDetailTab ] = useState(false);
    const [imgErr, setImgErr] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useOnClickOutside(ref, () => {
        setIsOpen(false);
    });


    const popupRef = useRef(null);

    const { language } = useLocalization();
    const t = useTranslation();

    const [activeStopoverTab, setActiveStopoverTab] = useState("list");
    const [hoverStopover, setHoverStopover] = useState("");

    const [dateFilter, setDateFilter] = useState({
        minDate:new Date("1857"),
        maxDate:new Date("1860")
    })


    const [state, setState] = useState({
      persons:[],
      stopovers:[],
      lists:[],
      institutions:[],
      scientific_specimen:[],
      documents:[],
      selleny_works:[],
      activeVoyage:"",
      query:"",
      allData:[],
      pageIntroInfo:""
    });

    const [value] = useDebounce(state.query, 1000);

    const mapRef = useRef(null);

    const handleStopoverClick = (stopOver) => {
        // flyto the location 
        // mapRef.current.getMap().setMinZoom(1);
        
        if(mapRef.current) {
            // if(mapRef.current.getZoom() > 10) {
                // mapRef.current.setCenter([...stopOver['COORDINATES']].reverse());
            // } else { 
                let coords = [...stopOver['COORDINATES']].reverse();
                if(isMobile) {
                    coords[0] += 0.1;
                }
                mapRef.current.flyTo({ 
                    center: coords,
                    zoom:10 
                });
            // }
          
            //
        }

        // mapRef.current.getMap().once("zoomend", () => {
        //     mapRef.current.getMap().setMinZoom(9);
        // });
    
        // update the stopover
        if(activeStopOver && stopOver.id == activeStopOver.id) {
            // 
        } else {
            ///   
        }

        setActiveStopOver({...stopOver, rand:Math.random()});
        
        setShowDetailTab(false);
        setActiveTab("");
        setActiveItem("");
        setActiveLink("");
        setLayerTabOpen(false);
    }

    const handleZoomEnd = (e) => {
        if(mapRef.current && activeStopOver) {
            // mapRef.current.getMap().setMinZoom(9);
        }
    }

    const closeStopoverPopup = () => {
        if(popupRef.current) {
            popupRef.current.remove();
        }
    }

    const updateDownloadProgress = ({ loaded, total}) => {
        if(loaded && total) {
            // if(downloadProgress < (loaded * 100/total).toFixed(1)) {
                setDownloadProgress((loaded * 100/total).toFixed(1));
            // }
            
        }
        
    }

    const loadData = useCallback(async () => {
        setIsDataLoading(true);
        let data = await getData(updateDownloadProgress);
        let pageIntroInfo = await loadPageIntroSections();

        console.log(pageIntroInfo);
        let resources = ["institutions", "persons", "scientific_specimen", "documents"];
        let allData = [];


        resources.forEach(resource => {
            let info = data[resource].map((entry,i) => ({id:i, ...entry, category:resource }));

            allData = [...allData, ...info];
        });

        allData = allData.map((entry, i) => ({id:i, ...entry}));

        setState((prevState) => ({...prevState, ...data, allData, pageIntroInfo }));
        
        setIsDataLoading(false);
        setIsLoadied(true);
      }, [setIsLoadied]);
    
      useEffect(() => {
        if(!isLoaded) {
          loadData();
        }
    }, [isLoaded, loadData]);


    const handleSliderChange = (val) => {
        let [minDate, maxDate] = sliderValuesToDates(val);
        setDateFilter({minDate, maxDate});
    }

    const filterByDateRange = (stopover) => {
        let date = dayjs(stopover['ARRIVAL DAY'], ['DD/MM/YYYY', 'MMMM YYYY']).unix();
        let {minDate, maxDate} = dateFilter;

        return date > (minDate.valueOf()/1000) && date < (maxDate.valueOf()/1000);
    }

    const getActiveTableInfo = (tableName) => {
        // console.log(activeStopOver);

        if(activeStopOver) {
            return state.allData.filter(entry => entry.stopover)
                .filter(entry => (entry.category == tableName && entry.stopover.toLocaleLowerCase() == activeStopOver['MAIN PLACE'].toLocaleLowerCase()))
        } else {
            return state.allData.filter(entry => entry.category == tableName);
        }
       
    }

    const { scientific_specimen, stopovers, activeVoyage, allData } = state;


    const voyages = useMemo(() => {
        return [...new Set(stopovers.map(stopover => stopover['VOYAGE VARIANTS']))]
    }, [stopovers]);

    let targetStopOvers = useMemo(() => {
        return state.query ?
            stopovers.filter(stopover => (
                stopover['STOPOVER'].toLocaleLowerCase().includes(state.query.toLocaleLowerCase()) ||
                stopover['MAIN PLACE'].toLocaleLowerCase().includes(state.query.toLocaleLowerCase())
            )) :
            stopovers;
    }, [state.query, stopovers]);

    // if(activeVoyage) {
        targetStopOvers = useMemo(() => (!activeVoyage ?  targetStopOvers : targetStopOvers.filter(stopover => stopover['VOYAGE VARIANTS'] == activeVoyage)), [activeVoyage, targetStopOvers]);
    // }
    
    const toggleActiveLayers = (e) => {
        let { name, checked} = e.target;
        let layers = [...activeLayers];
        layers = checked ? [...layers, name] : layers.filter(layer => layer !== name);

        setActiveLayers(layers);
    }

    const toggleActiveTable = (tableName) => {
        if(activeTable == tableName) {
          setActiveTable(null);
        } else {
          setActiveTable(tableName);
        }
    
        setIsSummaryClick(false);
    }

    const resetMap = () => {
        setActiveStopOver(null);
        setLayerTabOpen(false);
        setActiveImage(null);
        setActiveItem(null);
        
        // mapRef.current.getMap().setMinZoom(1);
        // setTimeout(() => {
            mapRef.current.flyTo({
                center:[16.45, 39.76],
                zoom: 1.8
            });
        // }, 200)
        


        if(popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
        }
    
    }


    const getItalianName = (mainPlace) => {
        let stopOver = stopovers.find(stopOver => stopOver['MAIN PLACE'] == mainPlace);

        return stopOver['ITA_MAIN PLACE'];
    }

    useEffect(() => {
        if(activeLink) {
            window.open(activeLink, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
            setActiveLink("");
        }

    }, [activeLink]);

    useEffect(() => {
        if(activeItem) {
            let [latitude, longitude] = activeItem.info['COORDINATES'];

            mapRef.current.flyTo({
                center:[longitude, latitude],
                zoom: 11
            });
        }
    }, [activeItem])

    const groupedStopOvers = targetStopOvers
    .sort((a,b) => dayjs(a['ARRIVAL DAY'], ['DD/MM/YYYY', 'MMMM YYYY']).unix() - dayjs(b['ARRIVAL DAY'], ['DD/MM/YYYY', 'MMMM YYYY']).unix())
    .reduce((a,b) => {
        let mainPlace = b['MAIN PLACE'];
        if(a[mainPlace] && !['POLA', 'MUGGIA', 'GIBRALTAR'].includes(mainPlace)) {
            if(a[mainPlace].find(entry => entry['STOPOVER'] == b['STOPOVER'])) {
                return a;
            }
            a[mainPlace].push(b);
        } else {
            if(['POLA', 'Muggia', 'Pola', 'Gibraltar'].includes(b['STOPOVER'])) {
                a[`${mainPlace}-${b.id}`] = [b];
            } else{
                a[mainPlace] = [b];
            }
           
        }

        return a;
    }, {});

    // console.log(groupedStopOvers);

    const getCategoryColor = (category) => {
        let colors = {
            "stopovers":"red",
            "persons":"orange",
            "documents":"#5F9EA0",
            "institutions":"grey",
            "scientific_specimen":"green"
        }

        return colors[category];
    }

    
    // const [currentIndex, setCurrentIndex] = useState(-1);
    let currentIndex = useMemo(() => {
        return activeStopOver ? targetStopOvers.findIndex(stopOver => stopOver.id == activeStopOver.id) : -1;
    }, [activeStopOver, targetStopOvers])

    const nextIndex = () => {
        if(currentIndex < targetStopOvers.length - 1) {
            handleStopoverClick(targetStopOvers[currentIndex + 1])
        } else {
            handleStopoverClick(targetStopOvers[0])
        }
    }

    const prevIndex = () => {
        if(currentIndex == 0) {
            handleStopoverClick(targetStopOvers[targetStopOvers.length -1])
        } else {
            handleStopoverClick(targetStopOvers[currentIndex-1])
        }
    }


    const tabClassName = `tab flex items-center px-1 font-semibold text-xs cursor-pointer hover:bg-gray-400 hover:text-white py-1`;
    const itemListing = useMemo(() => {
        if(activeStopOver) {
            console.log("Filtering")
            return allData.filter(entry => activeLayers.includes(entry.category)).filter(entry => entry.stopover == activeStopOver['MAIN PLACE'])
        } 
        return [];
    }, [activeStopOver, allData, activeLayers]);
    // close and open panels

    // console.log(groupedStopOvers);
    // console.log([...new Set(state.stopovers.map(stopover => stopover['ITA_VOYAGE VARIANTS']))]);
    return (
        <MainLayout>
            { isDataLoading && <div className='absolute z-[100] top-0 left-0 w-full bg-black/80 h-full flex items-center justify-center'>
                <div className=" bg-white/0 p-2 rounded-md flex flex flex-col items-center text-white">

                    {/* <div className="loading-bar-background">
                        <div className="loading-bar" style={{ width: `${downloadProgress}%`}}></div>
                    </div> */}

                    <div className="images relative h-40 w-40 flex items-center justify-center">
                        <img src="/icons/freeze.png" alt=""  className='absolute top-8 right-12 h-16 w-16'/>
                        <img src="/icons/rotate.png" alt=""  className='absolute top-0 h-32 w-32 animation-spin'/>
                    </div>

                    Loading.... {downloadProgress}%
                </div>    
            </div>}
             {activeImage && <ImageViewer imageUrl={activeImage} alt="" className='rounded-md w-full object-cover h-full z-[70]' showImage={false} onClose={() => setActiveImage(null)} />}
           
            <div className="map-container relative flex w-full">
           
    
             <nav className="flex w-full absolute top-0 left-0 z-[68] bg-white items-center justify-center" aria-label="Breadcrumb">
                 <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse p-2">
                        <li className="inline-flex items-center">
                            <div href="#" onClick={resetMap} className="bg-gray-100 py-1 px-4 rounded-3xl cursor-pointer inline-flex items-center text-sm font-medium text-gray-700">
                                    <img src="/globe.png" alt="" className='h-[32px] mr-2'/>
                               
                                {t('globe')}
                            </div>
                        </li>
                        { activeStopOver ?
                        <li className='hidden md:block'>
                            <div className="flex items-center relative">
                                <svg className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                </svg>

                                <div className=" mx-4 flex items-center">
                                    <button onClick={() => prevIndex()} className="carousel btn z-10 top-[50%] left-0 bg-gray-100 text-black rounded-full p-1">
                                        <RiArrowLeftSLine />
                                    </button>

                                    <div href="#" className="ms-1 mx-3 text-sm font-medium text-gray-700">
                                        {activeStopOver['MAIN PLACE']} <span className='text-[#AD9A6D]'>({activeStopOver['STOPOVER']})</span>
                                    </div>

                                    <button onClick={() => nextIndex()} className="carousel btn z-10 top-[50%] right-0 bg-gray-100 text-black rounded-full p-1">
                                        <RiArrowRightSLine />
                                    </button>

                                   
                                   
                                </div>
                                
                            </div>
                        </li> : "" }
                    </ol>

                    { activeStopOver && <div className='toggler relative mx-5'>
                        <div className=' hidden flex cursor-pointer hover:bg-gray-100 focus:bg-gray-100 px-2 rounded-md border-[1px]' onClick={() => {setLayerTabOpen(!isLayerTabOpen)}}>
                            {t('type')}
                            <RiArrowDownSLine  className='ml-3'/>
                        </div>

                        <div className="relative bg-white flex">
                            {
                                [ "persons", "institutions", "scientific_specimen", "documents"].map((item)  => {
                                    let label = item.split("_")[1] || item;
                                    return (
                                        <div className="flex w-full" key={item}>
                                            <label htmlFor={item} className='w-full flex items-center hover:bg-gray-200 cursor-pointer p-2'>
                                                <input 
                                                    type="checkbox" 
                                                    name={item} 
                                                    id={item}  
                                                    className='h-0 w-0' 
                                                    defaultChecked={activeLayers.includes(item)}
                                                    onChange={toggleActiveLayers} 
                                                />
                                                <div 
                                                    style={{
                                                        background:activeLayers.includes(item) ? getCategoryColor(item) : ""
                                                    }}
                                                    className={`${activeLayers.includes(item) ? `` : 'bg-gray-100' } p-2 rounded-full text-white`}>
                                                    {getMarkerIcon(item)}   
                                                </div>
                                                {/* <span className='mx-2 capitalize'>{t(label) || label}</span> */}
                                            </label>                                            
                                        </div>
                                    )
                                })
                            }
                        </div>
                        
                    </div> }
                </nav> 

                <div className="w-full">
                    <MainMap projection={"globe"} basemap={"daks"} ref={mapRef} minZoom={1}>
                        {state.stopovers.length && <StopOverMarkers 
                            hoverItem={hoverStopover} 
                            stopovers={state.stopovers} 
                            handleImageClick={setActiveImage} 
                            handleClick={handleStopoverClick} 
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            activeStopOver={activeStopOver}
                            showDetailTab={showDetailTab}
                            setShowDetailTab={setShowDetailTab}
                            mapRef={mapRef}
                        />}

                        <Source type="geojson" data={Novara}>
                            { <Layer {...dataLayer} /> }
                        </Source>

                        { activeStopOver  ? <Markers 
                            handleImageClick={setActiveImage}
                            setShowDetailTab={setShowDetailTab}
                            // hoverItem={hoverItem}
                            hoverItem={null}
                            activeItem={activeItem}
                            popupInfo={popupInfo}
                            setPopupInfo={setPopupInfo}
                            setShowSpline={setShowSpline}
                            closeStopoverPopup={closeStopoverPopup}
                            items={itemListing} 
                            setActiveItem={setActiveItem} 
                            setActiveTab={setActiveTab}
                        /> : "" }

                       
                    </MainMap>
                </div>

                <CollapsibleTab
                    position="top-right"
                    tooltipTitle={t("about")}
                    collapseIcon={<ChevronsLeft className="text-gray-100" />}
                    collapseClass="hidden md:block about-tab absolute z-20 right-6 top-16 bg-white w-[450px] h-[400px] overflow-y-auto rounded-[10px] shadow-round border-[0px] border-[#AD9A6D]"
                >
                    <div className="about-section bg-white text-black p-[20px] h-full overflow-y-auto mt-5">
                        {state.pageIntroInfo ? htmlToReactParser.parse(state.pageIntroInfo[language]) : ""}                        
                    </div>
                </CollapsibleTab>
                
                <CollapsibleTab
                    collapseIcon={<MapPin className="text-gray-100 "/>}
                    position="top-left"
                    tooltipTitle={t("stopovers")}
                    collapseClass="absolute w-96 bg-white left-2 md:left-6 top-20 md:top-16 z-20 rounded-[10px] shadow-round border-[4px] border-[#AD9A6D]"
                >
                    <div className='w-full bg-white left-6 top-16 overflow-hidden rounded-[10px]'>

                        <div className="px-2 w-fit text-[24px] text-black w-full bg-white flex items-center py-4 rounded-xl">
                            <span className="font-semibold capitalize">{t('stopovers')} ({targetStopOvers.length})</span>
                        </div>

                        <div className="tab-toggler rounded-[10px] w-full">
                            <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-t border-gray-200 w-full uppercase">
                                <li className="flex-1">
                                    <a href="#" onClick={() => setActiveStopoverTab("list")} aria-current="page" 
                                        className={`w-full inline-block p-2  ${ activeStopoverTab == "list" ? 'bg-gray-100 text-blue-600' : ''} rounded-t-sm active dak:bg-gray-800 dak:text-blue-500`}
                                    >
                                        {t('list')}
                                    </a>
                                </li>
                                <li className="flex-1">
                                    <a href="#"  onClick={() => setActiveStopoverTab("timeline")} 
                                        className={`w-full inline-block p-2 ${ activeStopoverTab == "timeline" ? 'bg-gray-100 text-blue-600' : ''} rounded-t-sm hover:text-gray-600 hover:bg-gray-50 dak:hover:bg-gray-800 dak:hover:text-gray-300`}
                                    >
                                        {t('timeline')}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 py-2 uppercase font-medium">
                                    
                                    <input 
                                        type="text" 
                                        placeholder={t('search_stopover')}
                                        defaultValue={""}
                                        onChange={(e) => {
                                            setState({...state, query:e.target.value});
                                        }}
                                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dak:bg-gray-700 dak:border-gray-600 dak:placeholder-gray-400 dak:text-white dak:focus:ring-blue-500 dak:focus:border-blue-500'
                                    />
                                </div>

                                <div className="p-4 py-2">
                                    <h5 className=''>{t('voyage_label')}</h5>
                                    
                                    <div className="w-full relative" ref={ref}>
                                        <button 
                                            id="dropdownDividerButton" 
                                            onClick={() => setIsOpen(!isOpen)}
                                            data-dropdown-toggle="dropdownDivider" 
                                            className="h-[42px] overflow-hidden relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full" type="button">
                                                <p className='w-full px-3 m-0 text-left'>
                                                    {activeVoyage ? t(activeVoyage).slice(0,42) : t('all_voyages')}
                                                </p>
                                                
                                                <svg className="w-2.5 h-2.5 ms-3 absolute top-4 right-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                                                </svg>
                                        </button>

                                        { isOpen && <div className="options bg-white z-10 shadow-md my-3 pt-1 absolute left-0 top-8">
                                            {(voyages.map((voyage, i) => (<div 
                                                key={i} value={voyage}
                                                onClick={() => { setState({...state, activeVoyage:voyage}); setIsOpen(false); }}
                                                className='flex items-center text-sm border-b border-[#ddd] p-1 hover:bg-gray-100 cursor-pointer'
                                            >
                                                <div 
                                                    className=" !h-4 !w-4 rounded-full mr-2" 
                                                    style={{ background:(voyageColorCards[voyage] || "#ff0000")}} 
                                                >
                                                </div>

                                                <div className='flex-1'>
                                                    <span className='mx-1'>
                                                        {t(voyage) || voyage}
                                                    </span>
                                                </div>
                                               
                                               
                                            </div>) ))}
                                        </div> }
                                    </div>
                                   

                                    <select name="voyage" id="voyage"
                                        defaultValue={""}
                                        onChange={(e) => {
                                            setState({...state, activeVoyage:e.target.value});
                                        }}
                                        className='hidden bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dak:bg-gray-700 dak:border-gray-600 dak:placeholder-gray-400 dak:text-white dak:focus:ring-blue-500 dak:focus:border-blue-500'
                                    >
                                        <option value="" >{t('all_voyages')}</option>
                                        {(voyages.map((voyage, i) => (<option 
                                            key={i} value={voyage}
                                            style={{ background:(voyageColorCards[voyage] || "#ffffff") + "ba"}} 
                                        >
                                            {t(voyage) || voyage}
                                        </option>) ))}
                                    </select>
                                </div>

                        { activeStopoverTab == "timeline" ? <div className="relative text-white timeline-section bg-[#2B222D] w-full h-full overflow-hidden">
                            <div className="timeline-header p-4">
                                <div className="title font-semibold font-medium uppercase hidden">
                                    {t('stopovers')}

                                    ({
                                    [...stopovers]
                                    // .filter(stopover => stopover['ARRIVAL DAY'] !== "N.A.")
                                    .filter(filterByDateRange).length
                                    })
                                </div>
                                <div className="range-slider my-3">
                                    {/* tick mark on different years, mover the toggler into search tab, preview tab (remove once the detail tab opens) */}
                                    {/* <RangeSlider className="bg-orange-400" id="range-slider"/> */}

                                    <Slider 
                                        range  
                                        onChange={handleSliderChange} 
                                        marks={marks}
                                        step={2}
                                        max={64}
                                        defaultValue={[0, 64]}
                                    />
                                </div>
                            </div>

                            <div className="timeline-body grid grid-cols-2 gap-2 p-6 h-[calc(50vh-217px)] overflow-auto">
                                {
                                    [...targetStopOvers]
                                        .filter(stopover => stopover['ARRIVAL DAY'] !== "N.A.")
                                        .sort((a,b) => dayjs(a['ARRIVAL DAY'], ['DD/MM/YYYY', 'MMMM YYYY']).unix() - dayjs(b['ARRIVAL DAY'], ['DD/MM/YYYY', 'MMMM YYYY']).unix())
                                        .filter(filterByDateRange)
                                        .map((stopover,i) => (
                                            <div key={i} className='cursor-pointer text-white text-sm bg-white w-full relative' onClick={() => handleStopoverClick(stopover)}>
                                                <div className="absolute top-2 left-2 bg-white/80 text-black text-center uppercase p-1 text-xs font-normal">
                                                    {stopover['ARRIVAL DAY']}
                                                </div>
                                                <div className="absolute bottom-0 left-0 bg-black/50 w-full text-center uppercase">{stopover['STOPOVER']}</div>
                                                {/* <img src={sc['FEATURED IMAGE']}  className='h-40'/> */}
                                                <img src={stopover['IMAGES']} className="h-40 w-full" />
                                            </div> )
                                        )
                                }
                            </div>
                        </div> : "" }

                        { activeStopoverTab == "list" ? <div
                            className="stopover-cards bg-white w-full"
                        >
                            

                            <div className="py-2 h-auto w-full overflow-hidden">

                                <ul className="w-full h-[calc(50vh-140px)] overflow-y-auto overflow-x-hidden text-sm font-medium text-gray-900 rounded-none dak:bg-gray-700">
                                    {
                                        Object.keys(groupedStopOvers).map((mainPlace,i) => {
                                            if(groupedStopOvers[mainPlace].length > 1) {
                                                return (
                                                <Accordion title={language == "it" ? getItalianName(mainPlace):  mainPlace} key={mainPlace}>
                                                    {
                                                    groupedStopOvers[mainPlace].map(stopOver => {
                                                        return (
                                                            <StopOverCard 
                                                                key={`${stopOver['STOPOVER']}-${i}`}  
                                                                stopOver={stopOver} 
                                                                onClick={() => handleStopoverClick(stopOver)} 
                                                                activeStopOver={activeStopOver} 
                                                                hoverStopover={hoverStopover}
                                                                setHoverStopover={setHoverStopover}
                                                            />
                                                        )
                                                        
                                                    })
                                                }
                                                </Accordion>)
                                            }

                                            let stopOver = groupedStopOvers[mainPlace][0];

                                            return (
                                                <StopOverCard 
                                                    key={`${stopOver['STOPOVER']}-${i}`}  
                                                    stopOver={stopOver} 
                                                    onClick={() => handleStopoverClick(stopOver)} 
                                                    activeStopOver={activeStopOver} 
                                                    setHoverStopover={setHoverStopover}
                                                    hoverStopover={hoverStopover}
                                                />
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        </div> : ""}

                    </div>

                </CollapsibleTab>



                { showDetailTab ? 
                    <DetailTab 
                        setActiveStopOver={() => setActiveStopOver("")} 
                        setActiveTab={setActiveTab}
                        setHoverItem={setHoverItem}
                        data={allData.filter(entry => entry.stopover == activeStopOver['MAIN PLACE'])}
                        tableInfo={allData.filter(entry => entry.stopover == activeStopOver['MAIN PLACE']).filter(entry => entry.category == activeTab)}
                        activeTab={activeTab}
                        activeStopOver={activeStopOver}
                        setActiveLink={setActiveLink}
                        setShowDetailTab={setShowDetailTab}
                        setActiveItem={setActiveItem}
                    /> : 
                    ""
                }
            
                <CollapsibleTab
                    collapseIcon={<ChevronsRight className="text-gray-500"/>}
                    
                    collapseClass="layer-cards absolute z-20 left-0 right-0 mx-auto w-[500px] bottom-0 min-w-[40px] min-h-[40px] hidden"
                >
                    <div className="flex space-x-2 py-3 flex px-3 bg-white/40 rounded-t-[5px] shadow-round">
                    {/* <div className={tabClassName} onClick={() => toggleActiveTable("stopovers")}>StopOvers</div> */}
                    <div className={tabClassName} onClick={() => toggleActiveTable("persons")}>{t('persons')}</div>
                    <div className={tabClassName} onClick={() => toggleActiveTable("documents")}>{t('documents')}</div>
                    <div className={tabClassName} onClick={() => toggleActiveTable("scientific_specimen")}>{t('scientific_specimen')}</div>
                    <div className={tabClassName} onClick={() => toggleActiveTable("institutions")}>{t('institutions')}</div>
                    {/* <div className={tabClassName} onClick={() => toggleActiveTable("guide")}>Guide</div> */}
                    </div>
                
                </CollapsibleTab>

                { 
                    activeTable && <Modal activeTab={activeTable} isOpen={true} toggleActiveTable={setActiveTable}>
                    {/* <Table data={state[activeTable]} columnNames={[]} columnMapping={{}}/> */}
                        <div className="w-full h-full">
                            <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200">
                                <li className="me-0">
                                    <a 
                                        href="#" 
                                        onClick={(e) => { e.preventDefault(); setActiveView('table'); }} 
                                        className={`inline-block p-4 hover:bg-gray-50 ${activeView == "table" ? "text-blue-600 bg-gray-100" : ""}`}
                                    >
                                        Table
                                    </a>
                                </li>

                                <li className="me-0">
                                    <a 
                                        href="#" 
                                        className={`inline-block p-4 hover:bg-gray-50 ${activeView == "charts" ? "text-blue-600 bg-gray-100" : ""}`}
                                        onClick={(e) => { e.preventDefault(); setActiveView('charts'); }} 
                                    >
                                        Charts
                                    </a>
                                </li> 
                            </ul>

                            <div className={`table-view w-full h-full ${activeView == "table" ? "" : " hidden"}`}>
                                {
                                    isSummaryClick ? 
                                    <Grid 
                                        data={getActiveTableInfo(activeTable)} 
                                        columnNames={[]} 
                                        columnMapping={{}}
                                        tableName={activeTable} 
                                        setActiveItem={setActiveItem}
                                    />
                                    :
                                    <Grid 
                                        // data={state[activeTable]} 
                                        data={getActiveTableInfo(activeTable)}
                                        columnNames={[]} 
                                        columnMapping={{}}
                                        tableName={activeTable} 
                                        setActiveItem={setActiveItem}
                                    />
                                }
                            </div> 

                            <div className={`chart-view w-full h-full ${activeView == "charts" ? "" : "hidden"}`}>
                                <Charts  tableName={activeTable} tableData={state[activeTable]} />
                            </div>

                        </div>
                    </Modal>
                }

                <CollapsibleTab
                    position="bottom-left"
                    tooltipTitle={t("summary")}
                    collapseIcon={<ChevronsRight className="text-gray-100"/>}
                    collapseClass="summary-cards absolute z-20 left-6 bottom-4  min-w-[40px] min-h-[40px] hidden md:block"
                >
                    <div className="space-x-0 py-2 flex px-3 bg-white rounded-[25px] shadow-round pl-[50px]">

                    <div className="tab flex items-center px-1 border-l cursor-pointer" onClick={() => {setIsSummaryClick(true); setActiveTable('persons');}}>
                        <div className="icon mx-1">
                            <Users size={20} color="orange" />
                        </div>
                        <div className="count flex flex-col items-center">
                            <span className="text-xs text-gray-500 font-semibold mb-[-5px] capitalize">{t('persons')}</span>
                            <span className="text-xl font-bold text-gray-900 text-center w-full">
                            { activeStopOver ? 
                                state.persons.filter(person => (person['MAIN ENCOUNTER PLACE'] && person['MAIN ENCOUNTER PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACE'].toLocaleLowerCase()) ).length :
                                state.persons.length
                            }
                            </span>
                        </div>
                    </div>           

                    <div className="tab flex items-center px-1 border-l cursor-pointer" onClick={() => {setIsSummaryClick(true); setActiveTable('institutions');}}>
                        <div className="icon mx-1">
                            <School size={20} color="gray" />
                        </div>
                        <div className="count flex flex-col items-center justify-between">
                        <span className="text-xs text-gray-500 font-semibold mb-[-5px] capitalize">{t('institutions')}</span>
                        <div className="text-xl font-bold text-gray-900 text-center w-full">
                            {
                            activeStopOver ?
                            state.institutions.filter(institution => institution['INSTITUTION NAME']).filter(institution => {
                                return (institution['MAIN PLACE'] && institution['MAIN PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACE'].toLocaleLowerCase());
                            }).length
                            : state.institutions.filter(instiution => instiution['INSTITUTION NAME']).length
                            }
                        </div>
                        </div>
                    </div>
         
                    <div className="tab flex items-center px-1 cursor-pointer ml-8" onClick={() => {setIsSummaryClick(true); setActiveTable('scientific_specimen');}}>
                        <div className="icon mx-1">
                            <Bird size={20} color="#4AB46C"/>
                        </div>
                        <div className="count flex flex-col items-center relative h-full">
                            <span className="text-xs text-gray-500 font-semibold mb-[-5px] capitalize">{t('specimens')}</span>
                            <div className="text-xl font-bold text-gray-900 text-center w-full">
                            {
                                activeStopOver ?
                                state.scientific_specimen.filter(inst => inst['MAIN PLACE']).filter(institution => {
                                return (institution['MAIN PLACE'] && institution['MAIN PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACE'].toLocaleLowerCase());
                                }).length
                                : state.scientific_specimen.length
                            }
                            </div>
                        </div>
                    </div>

                    <div className="tab flex items-center px-1 border-l cursor-pointer" onClick={() => {setIsSummaryClick(true); setActiveTable('documents');}}>
                        <div className="icon mx-1">
                            <File size={20} color="#5f9ea0" />
                        </div>
                        <div className="count flex flex-col items-center justify-between">
                        <span className="text-xs text-gray-500 font-semibold mb-[-5px] capitalize">{t('docs')}</span>
                        <div className="text-xl font-bold text-gray-900 text-center w-full">
                            {
                            activeStopOver ?
                            state.documents.filter(doc => doc['TITLE / NAME']).filter(document => {
                                return (document['MAIN COLLECTION PLACE'] && document['MAIN COLLECTION PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACE'].toLocaleLowerCase());
                            }).length
                            : state.documents.filter(doc => doc['TITLE / NAME']).length
                            }
                        </div>
                        </div>
                    </div>



                    </div>
                    
                </CollapsibleTab>

               {/* {
                activeItem ? (activeItem && activeItem.table == "scientific_specimen") ? 
                    <ScientificCollectionModal popupInfo={activeItem.info} setActiveItem={setActiveItem} setActiveLink={setActiveLink} setShowSpline={setShowSpline} /> : 
                    <ActiveItemsCarousel 
                        activeItem={activeItem} 
                        items={allData.filter(entry => entry.category == activeItem.table)} 
                        setActiveItem={setActiveItem} setActiveLink={setActiveLink} 
                        isSpecimen={activeItem.table == "scientific_specimen"}
                        setShowSpline={setShowSpline}
                    /> : ""
                } */}

                    { activeItem  && <ActiveItemsCarousel 
                        activeItem={activeItem} 
                        items={activeStopOver ? allData.filter(entry => entry.stopover == activeStopOver['MAIN PLACE']).filter(entry => entry.category == activeItem.table) : allData.filter(entry => entry.category == activeItem.table)} 
                        setActiveItem={setActiveItem} setActiveLink={setActiveLink} 
                        isSpecimen={activeItem.table == "scientific_specimen"}
                        setShowSpline={setShowSpline}
                    />  }

                { ( showSpline )  ? <SpecimenSplineModal activeItem={activeItem} spline={showSpline} setShowSpline={setShowSpline} /> : "" }
            </div>

            {/* {activeLink ? <Modal activeTab={activeTab} isOpen={true} toggleActiveTable={setActiveLink}>
                <iframe src={encodeURI(activeLink)} width={"100%"} height={"100%"} target="_parent"></iframe>
            </Modal> : ""} */}
        </MainLayout>
    )
}

const Accordion = ({title, children}) => {
    const [isOpen, setIsOpen] = useState(true);
    

    return(
        <div className='accordion w-full'>
            <button className='w-full flex items-center bg-gray-0 p-2 rounded-md  relative ml-6 w-[calc(99%-2rem)]' onClick={() => setIsOpen(!isOpen)}>
                {title}
                { isOpen ? <ChevronDown className='mx-[10px]'/> : <ChevronUp className='mx-[10px]'/> }

                <span className="absolute left-[-1px] top-[-5px]  h-[65%] bg-gray-500/50 w-[2px]"></span>
                <span className="absolute left-[-1px] top-5 bottom-0 h-[60%] bg-gray-500/50 w-[2px]"></span>
            </button>

            <div className={`${isOpen ? 'block' : 'hidden'} bg-gray-200/20`}>
                {children}
            </div>
        </div>
    )
}

const StopOverCard = ({stopOver, onClick, activeStopOver, setHoverStopover, hoverStopover}) => {
    const t = useTranslation();
    const { language } = useLocalization();

    let bgColor = voyageColorCards[stopOver['VOYAGE VARIANTS']] || "#dddddd";
    let timeFrame =  language == "it" ? (stopOver['ITA_ARRIVAL DAY'] || stopOver['ARRIVAL DAY']) : stopOver['ARRIVAL DAY'];
    timeFrame = timeFrame ? timeFrame + " - ": "";
    timeFrame += language == "it" ? (stopOver['ITA_DEPARTURE DAY'] || stopOver['DEPARTURE DAY']) : stopOver['DEPARTURE DAY'];

    return (
        <li 
            style={{
                // background:(hoverStopover && stopOver.id == hoverStopover.id) ? "#d3d3d380" : ("#fff")
            }}
            className="w-full flex px-4 text-xs rounded-t-lg items-center cursor-pointer hover:bg-[#d3d3d380]"
            onClick={onClick}
            // onMouseOver={() => setHoverStopover(stopOver)}
            // onMouseLeave={() => setHoverStopover("")}
        >
            <div className="flex items-center flex-col relative h-full py-3">
                <div 
                    style={{ background: bgColor+"bf"}}
                    className={`${activeStopOver && activeStopOver['STOPOVER'] == stopOver['STOPOVER'] ? '!bg-green-800/40': '' } flex items-center justify-center rounded-full h-4 w-4`}
                >
                    <div className={`${activeStopOver && activeStopOver['STOPOVER'] == stopOver['STOPOVER'] ? 'bg-green-800' : 'bg-gray-500'}  w-1 h-1 rounded-full`}></div>
                </div>
                <span className="absolute top-[-5px]  h-[75%] bg-gray-500/50 w-[2px]"></span>
                <span className="absolute top-5 bottom-0 h-[80%] bg-gray-500/50 w-[2px]"></span>
            </div>
            <div className="border-b border-gray-300 w-full text-left px-3 py-3">
                
                {language == "it" ?
                    `${stopOver['ITA_MAIN PLACE']} (${stopOver['ITA_STOPOVER']})` :
                    `${stopOver['MAIN PLACE']} (${stopOver['STOPOVER']})`
                }
                {stopOver['ARRIVAL DAY'] || stopOver['DEPARTURE DAY'] ? <div className='text-[11px] text-gray-400'>
                  
                    {timeFrame}
                </div> : ""}
            </div>                  
        </li>
    )
}

const DetailTab = ({ setActiveTab, setShowDetailTab, data, activeTab, setActiveItem, setHoverItem, tableInfo, activeStopOver, setActiveLink}) => {
    const t = useTranslation();

    let colors = {
        "stopover":"#991b1b",
        "persons":"orange",
        "documents":"#5f9ea0",
        "institutions":"grey",
        "scientific_specimen":"green"
    }
    

    return (
        <div className="absolute z-[65] bg-[#F1F0EE] bg-white w-[90%] md:w-[450px] right-[20px] h-[calc(100vh-210px)] md:h-[calc(100vh-180px)] md:top-16 top-20 rounded-xl shadow-lg border-[3px] border-[#AD9A6D] overflow-hidden">
            <div className="max-h-full h-full text-[#54595f] overflow-y-auto overflow-x-hidden bg-[#F8F1E5] ">
                
                <div className="flex items-center w-full bg-white">
                    <div className="px-2 w-fit text-[24px] text-black w-full bg-white flex items-center py-4 rounded-t-xl">
                        <span className="font-semibold capitalize">{t('details')} ({data.length})</span>
                    </div>

                    <button className="zoom-in cursor-pointer rounded-full border-[#E9E4D8] border-[5px] mx-2 p-1 bg-[#AD9A6D] text-[#E9E4D8]" onClick={() => setShowDetailTab(false)}>
                        <X size={22}/>
                    </button>
                </div>
                
                

                <div className=" h-[88%]">
                    <div className="border-b border-gray-200 dak:border-gray-700">
                        <ul className="flex flex-wrap -mb-px text-[0.75rem] font-medium text-center py-2 bg-white" id="default-styled-tab" data-tabs-toggle="#default-styled-tab-content" data-tabs-active-classes="text-purple-600 hover:text-purple-600 dak:text-purple-500 dak:hover:text-purple-500 border-purple-600 dak:border-purple-500" data-tabs-inactive-classes="dak:border-transparent text-gray-500 hover:text-gray-600 dak:text-gray-400 border-gray-100 hover:border-gray-300 dak:border-gray-700 dak:hover:text-gray-300" role="tablist">
                            {
                            ['stopover', 'persons',  'institutions', 'scientific_specimen', 'documents'].map(tableName => {
                                return  (
                                <li key={tableName} className="mx-0 pl-[8px] mb-3" role="presentation">
                                     {/* <div className="></div> */}
                                    <button 
                                        onClick={() => setActiveTab(tableName)} 
                                        style={{
                                            borderColor:colors[tableName]
                                        }}
                                        className={`${tableName == activeTab ? 'text-[#ddd] border-[#191919] bg-[#191919]' : 'bg-white'} "text-xs rounded-full border-[1px] p-1 px-2 w-fit w-20 border-black text-center capitalize`}
                                        id="profile-styled-tab"
                                        data-tabs-target="#styled-profile" 
                                        type="button" 
                                        role="tab" 
                                        aria-controls="profile" 
                                        aria-selected="true"
                                    >
                                        {tableName.includes("specimen") ? t('specimens') : t(tableName.split("_").join(" ")) }
                                    </button>
                                </li>
                                )
                            })
                            }
                        </ul>
                    </div>

                    <div className="h-[90%] p-1">
                        <div className="py-0 px-0 w-full">
                            {
                                activeTab == "stopover" && 
                                    <ActiveItemInfoModal 
                                        isStopOver={true}
                                        popupInfo={activeStopOver} 
                                        setActiveItem={setActiveItem} 
                                        setActiveLink={setActiveLink}
                                        category="stopovers"
                                    />
                            }

                            { 
                                
                                ['persons',  'institutions', 'scientific_specimen', 'documents'].map(tableName => {
                                    return (activeTab == tableName) && <Table 
                                    key={tableName} 
                                    tableName={tableName} 
                                    setActiveItem={setActiveItem}
                                    setHoverItem={setHoverItem}
                                    data={tableInfo} 
                                    columnNames={columnNames[tableName]} columnMapping={{}} 
                                    /> 
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const SpecimenSplineModal = ({ activeItem, setShowSpline, spline }) => {
    // console.log(spline);
    return(
      <Modal activeTab={"specimens"} toggleActiveTable={() => setShowSpline("")} isOpen={true}>
        <iframe 
            className="spline-canvas h-[80%] my-auto" src={`https://my.spline.design/${spline}`} width="100%" frameBorder="0"></iframe>
      </Modal>
      
    )
  }

const ScientificCollectionModal = ({ popupInfo, setActiveItem, setActiveLink, setShowSpline, paginationText }) => {
    const {language} = useLocalization();
    const t = useTranslation();

    const onLinkClick = (e) => {
        e.preventDefault();
        setActiveLink(e.target.href);
    }

    let colors = {
        "stopovers":"red",
        "persons":"orange",
        "documents":"#5f9ea0",
        "institutions":"grey",
        "scientific_specimen":"green"
    }
    // console.log(popupInfo);
    // absolute right-0 top-[110px] rounded-xl border-[2px] border-[#000]
    return (
        <div 
            style={{ boxShadow:"0 -1px 20px 0 #ad9a6d"}} 
            className=" z-[45] bg-[#f1f0ee] md:w-[450px] w-full right-5 h-full detail-modal"
        >
            <div className="flex flex-col w-full p-[30px] max-h-full text-[#54595f] overflow-y-auto overflow-x-hidden ">
                {/* <button 
                    className="zoom-in absolute right-6 top-2 cursor-pointer rounded-full border-white border-[5px] p-1 bg-black text-white" 
                    onClick={() => setActiveItem(null)}
                >
                    <X size={22} className='font-bold'/>
                </button> */}

                <div className="flex items-center w-full justify-between top-0 mb-4">
                    <div className="shadow-md rounded-full border-[2px] border-[#191919] p-1 w-fit w-20 px-3 border-black text-md text-center uppercase">
                        <span className="font-semibold">{t('specimens')}</span>
                    </div> 

                   
                    <div className='w-full text-center font-semibold'>
                        <span>{paginationText}</span>
                    </div>
                    
                    <button className="zoom-in cursor-pointer rounded-full border-white border-[5px] p-1 bg-black text-white" onClick={() => setActiveItem(null)}>
                        <X size={24} className='font-bold text-white' fontWeight={900}/>
                    </button>
                </div>
  
              <div className="general-info flex-1 h-full w-full max-w-full text-[#363636]">
                {/* <div className="shadow-md rounded-full mb-4 border-[2px] px-5 w-fit min-w-20 border-black text-lg text-center uppercase">
                  <span className="font-semibold">{language == "it" ? popupInfo["ITA_SUBJECT"] : popupInfo['SUBJECT']}</span>
                </div> */}

  
                <div className="content h-full">

                    <div className="mb-3 rounded-full border-[1px] border-[#191919] p-1 w-fit w-20 px-3 border-black text-md text-center uppercase">
                        <span className="font-semibold">{language == "it" ? popupInfo["ITA_SUBJECT"] : popupInfo['SUBJECT']}</span>
                    </div> 


               
                  <div className="header-section flex flex-col">
                    <h2 className="text-[#363636] mb-[20px] relative">
                        <strong className='font-bold  text-[1.4em]'>{language == "it" ? popupInfo["ITA_NAME"] : popupInfo['NAME']}</strong>
                        <span  className="ct-span ">
                            <p>
                            <em className="italic text-[1.4em]">{popupInfo['SCIENTIFIC NAME']}</em></p>
                        </span>

                        

                    </h2>

                    <div className="px-0 relative image-div px-0 h-auto w-full min-h-16 bg-gray-200">
                        {/* <img src={popupInfo['FEATURED IMAGE']} className="w-full"/> */}
                        <ImageViewer imageUrl={popupInfo['FEATURED IMAGE']} className="w-full" showImage={true} onClose={console.log} cnName="w-full" />

                        { 
                            popupInfo['SPLINE-CODE']  && 
                            <button className="absolute right-4 bottom-4 bg-[#fff] rounded-md capitalize rounded-md p-0 w-12 h-12 z-[70] flex items-center justify-center" onClick={() => setShowSpline(popupInfo['SPLINE-CODE'])}>
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73zM16.5 9.4L7.5 4.21M3.27 6.96l8.73 5.04 8.73-5.04M12 22V12" />
                                </svg>
                            </button>
                        }

                        {/* { popupInfo['SPLINE-CODE']} */}
                    </div>

                    <div className="font-semibold">
                        <h5 className="text-title text-[1.2em] text-[#ad9a6d] my-3">
                            {/* Nomenclature adopted by the Novara scientists */}
                            {t('nomenclature_text')}

                            <div className='text-[#363636]'>
                                {popupInfo['NOMENCLATURE ADOPTED BY AUSTRIAN SCIENTISTS']}
                            </div>
                        </h5>

                        {/* <div className="">
                            {t('Class')}

                            <div className="">
                                <span>{popupInfo[ language == 'it' ? 'ITA_CLASS' : 'CLASS']}</span>
                            </div>
                        </div> */}

                        
                    </div>

                    <hr className='mt-3 border-black'/>
                    
  
                    {/* <h3 className="ct-headline text-xl color-dak mb-6 Nomenclature">
                      <span className="ct-span"><em className="italic">Ardea candidissima</em> Gmel.</span>
                    </h3> */}
  
                  </div>
  
                  <div className="body-section">
                    
                    <div className="summary-info bg-[#D4D4D4] flex-[0.6] p-[20px] rounded-[10px] h-full my-[16px]">
                        {/* <div className="py-0">
                            <h3 className="text-[24px] font-semibold">Details</h3>
                        </div> */}
    
        
                        <div className="info-section grid grid-cols-2 gap-2">
                        {/* 'IUCN INDEX' 'Owner', 'Dimension', 'Inventory Number', */}
                            {
                            ['Class', 'Collection place', 'Collection date',  'State of preservation',  'IUCN INDEX' ].map((field,i) => {
                                let colName = language == "it" ? `ITA_${field.toLocaleUpperCase()}` : field.toLocaleUpperCase();

                                if(!popupInfo[colName]) {
                                    return;
                                }

                                return (
                                    <div key={`${field}-${i}`} className="flex flex-col justify-between text-lg border-b border-[#ad9a6d] gap-2 items-start pt-2 text-sm w-full">
                                        <h4 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[17px] w-full">{t(field) || t(field.toLocaleLowerCase().split(" ").join("_"))}</h4>
                                        <h5 className="text-[1.1em] mb-3">{popupInfo[colName] || popupInfo[field.toLocaleUpperCase()]}</h5>
                                    </div>
                                )
                            })
        
                            }   
                        </div>

                        <div className="flex flex-col text-lg gap-2 items-start py-2 text-sm w-full">
                            <h4 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full capitalize">{t('owner')}</h4>
                            <h5 className="text-[1.1em]">{popupInfo["OWNER"]}</h5>
                        </div>
                    </div>                    



                    {(popupInfo['CATALOGUE DESCRIPTION'] || "") ?
                        <>
                        <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full capitalize">{t('Description') || "Description"}</h3>
                        <div className="mt-[2px] mb-[25px] text-[14px] text-gray-700">
                            {(popupInfo[language == 'it' ? 'ITA_CATALOGUE DESCRIPTION' : 'CATALOGUE DESCRIPTION'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">
                                {ref}
                            </p>))}
                        </div>

                        <hr className='my-3 border-black'/> </>
                        : ""}

                        { popupInfo['ITA_FROM THE SCIENTIFIC VOLUMES'] && <div className="description my-[25px] text-[14px] text-gray-700">
                            <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full">
                                { language !== "it" ? "From the scientific volumes" : "Dai volumi scientifici"}
                            </h3>
                            <div>
                                {(language == "it" ? popupInfo['ITA_FROM THE SCIENTIFIC VOLUMES'] || "" : popupInfo['FROM THE SCIENTIFIC VOLUMES'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>))}
                            </div>
                        </div> }

                    { 
                        popupInfo['QUOTATION']  ? <div className="description my-[25px] text-[14px] text-gray-700">
                            <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full capitalize">{t('quotation')}</h3>
                        <div>
                            {( language == "it" ? popupInfo['ITA_QUOTATION'] : popupInfo['QUOTATION'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>))}
                        </div>

                        <hr className='my-3 border-black'/>
                        </div> : "" 
                    }

  
                    {(popupInfo['REFERENCES LINKS'] || "") ?
                        <>
                        <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full">{t('resources')}</h3>
                        <div className="mt-[2px] mb-[25px] text-[14px] text-gray-700">
                            {(popupInfo['REFERENCES LINKS'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">
                                <a className="my-3 underline" href={ref} key={`${ref}-${i}`} onClick={onLinkClick}> {popupInfo['REFERENCES']}</a>
                            </p>))}
                        </div>

                        <hr className='my-3 border-black'/> </>
                        : ""}
                    
                   
  
                    <h3 className="text-title text-[18px] text-[#ad9a6d] font-semibold capitalize">{t('links')}</h3>
                    <div className="pb-5 text-[14px] text-gray-700">
  
                      {
                        popupInfo['LINKS'].split("\n").map((link,i) => (
                          <a className="my-3" href={link} key={`${link}-${i}`} onClick={onLinkClick}>
                            <span className="underline pointer-events-none">{link}</span>
                          </a>
                        ))
                      }
                     
  
                    </div>

                    <hr className='my-3 border-black'/>
  
                  </div>
                </div>
              </div>              
  
            </div>
      </div>
    )
}

const ActiveItemsCarousel = ({ items, setActiveLink, setActiveItem, activeItem, isSpecimen, setShowSpline }) => {
    // console.log(activeItem);
    // console.log(items);
    // let item = [...items].find(entry => entry.id == activeItem.info.id);
    // console.log(item);
    let itemIndex = [...items].findIndex(entry => entry.id == activeItem.info.id);
    // console.log(itemIndex);
    const [currentIndex, setCurrentIndex] = useState(itemIndex);

    useEffect(() => {
        setCurrentIndex(itemIndex);
    }, [activeItem,itemIndex, setCurrentIndex])

    const nextIndex = () => {
        if(currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setActiveItem({ info:items[currentIndex + 1], table:activeItem.table })
        } else {
            setCurrentIndex(0);
            setActiveItem({ info:items[0], table:activeItem.table })
        }
    }

    const prevIndex = () => {
        if(currentIndex == 0) {
            // let indes = 
            setCurrentIndex(items.length -1);
            setActiveItem({ info:items[items.length -1], table:activeItem.table })
        } else {
            setCurrentIndex(currentIndex - 1);
            setActiveItem({ info:items[currentIndex-1], table:activeItem.table })
        }
    }

    if(!activeItem) {
        return (<div>Item Not Found</div>);
    }

    // console.log(itemIndex, currentIndex);

    return (
        <div 
            style={{
                boxShadow: '0 -1px 20px 0 #ad9a6d'
            }}
            className='active-item absolute right-0 top-[130px] h-[calc(80vh-100px)] w-[90%] md:w-auto border-[2px] border-[#000000] z-[74] right-5 rounded-xl overflow-hidden'
        >
            {/* <Carousel items={items} currentIndex={currentIndex}> */}

                <button onClick={() => nextIndex()} className="carousel border-[1px] border-[#AD9A6D] btn absolute z-10 top-[50%] right-[1px] bg-white text-black rounded-full p-0">
                    <RiArrowRightSLine  size={28}/>
                </button>
                <button onClick={() => prevIndex()} className="carousel border-[1px] border-[#AD9A6D] btn absolute z-10 top-[50%] left-[1px] bg-white text-black rounded-full p-0">
                    <RiArrowLeftSLine  size={28}/>
                </button>


              
                { isSpecimen ? 
                    <ScientificCollectionModal 
                        popupInfo={items[currentIndex] || activeItem.info} 
                        setActiveItem={setActiveItem} 
                        setActiveLink={setActiveLink} 
                        setShowSpline={setShowSpline}
                        paginationText={`${currentIndex+1}/${items.length}`}
                    /> :
                    <ActiveItemInfoModal 
                        popupInfo={items[currentIndex] || activeItem.info} 
                        setActiveItem={setActiveItem} 
                        setActiveLink={setActiveLink}
                        category={activeItem?.table}
                        paginationText={`${currentIndex+1}/${items.length}`}
                    /> 
                }
            {/* </Carousel> */}
        </div>
    );

}

const ActiveItemInfoModal = ({ popupInfo, setActiveItem, setActiveLink, isStopOver=false, category, paginationText }) => {
    const t = useTranslation();
    let colors = {
        "stopovers":"red",
        "persons":"orange",
        "documents":"#5f9ea0",
        "institutions":"grey",
        "scientific_specimen":"green"
    }

    const onLinkClick = (e) => {
        e.preventDefault();
        setActiveLink(e.target.href);
    }

    if(category == "stopovers") {
        return <StopOverDiv 
            popupInfo={popupInfo} 
            setActiveItem={setActiveItem} 
            setActiveLink={setActiveLink}
            category={popupInfo.category}
            onLinkClick={onLinkClick}
        />
    }

    return (
        <div 
            style={{boxShadow:  !isStopOver? "0 -1px 20px 0 #ad9a6d" : "" }}
            className={`detail-modal ${ !isStopOver ? 'overflow-y-auto h-full md:w-[445px] w-[100%] rounded' : ''} bg-[#f1f0ee] `}
        >
            <div className={`flex flex-col w-full px-[30px] py-[30px] max-h-full ${ !isStopOver ? 'space-x-0' : ''} text-[#54595f] overflow-y-auto overflow-x-hidden`}>

                <div className="flex items-center w-full justify-between top-0 mb-5">
                    <div className="flex justify-start flex-1"> 
                        { popupInfo.category  && <div className="shadow-md  rounded-full border-[1px] p-1 px-3 border-black text-center uppercase" style={{ borderColor: colors[popupInfo.category]}}>
                            <span className="font-semibold" >{t(popupInfo.category)}</span>
                        </div> }
                    </div>
                     
                    
                    <div className='w-full text-center font-semibold flex-1 '>
                        <span>{paginationText}</span>
                    </div>
                    
                    <div className="flex-1 items-end flex justify-end relative">
                        <button className="static top-0 zoom-in cursor-pointer rounded-full border-white border-[5px] p-1 bg-black text-white" onClick={() => setActiveItem(null)}>
                            <X size={24} className='font-bold text-white' fontWeight={900}/>
                        </button>
                    </div>
                    
                </div>
                             

                { category == 'institutions' && 
                    <InstitutionDiv  
                        popupInfo={popupInfo} 
                        setActiveItem={setActiveItem} 
                        setActiveLink={setActiveLink}
                        category={popupInfo.category}
                        onLinkClick={onLinkClick}
                    /> 
                }

                { category == 'persons' && 
                    <PersonsDiv 
                        popupInfo={popupInfo} 
                        setActiveItem={setActiveItem} 
                        setActiveLink={setActiveLink}
                        category={popupInfo.category}
                        onLinkClick={onLinkClick}
                    /> 
                }

                { category == 'documents' && 
                    <DocumentsDiv
                        popupInfo={popupInfo} 
                        setActiveItem={setActiveItem} 
                        setActiveLink={setActiveLink}
                        category={popupInfo.category}
                        onLinkClick={onLinkClick}
                    /> 
                }

        </div>
      </div>
    )
}


const StopOverMarkers = ({ mapRef, setShowDetailTab, showDetailTab, stopovers, handleClick, activeStopOver, setActiveTab, handleImageClick, hoverItem, activeTab }) => {
    const t = useTranslation();
    const { language } = useLocalization();
    const [activeEntry, setActiveEntry] = useState((activeTab && !activeStopOver) ? "" : {...activeStopOver});
    const [imgErr, setImgErr] = useState("");
    const popupRef = useRef(null);
    // const map = 

    // console.log(showDetailTab, activeTab);

    useEffect(() => {
        if(popupRef.current && !showDetailTab) {            
            popupRef.current.addTo(mapRef.current.getMap());
            // popupRef.current = null;
        }
    }, [activeStopOver, showDetailTab, mapRef]);

    const handelMarkerClick = (e, stopOver) => {
        e.stopPropagation();
        handleClick({...stopOver});
    }

    // console.log(activeEntry);
    return(
      <>
        {stopovers.map((stopover,i) => {
          let [latitude, longitude] = stopover['COORDINATES'];
        //   console.log(latitude, longitude, stopover['STOPOVER']);
            let bgColor = voyageColorCards[stopover['VOYAGE VARIANTS']] + "bf";

          return <Marker 
            key={`${stopover['MAIN PLACE']}-${i}`} 
            latitude={latitude} 
            longitude={longitude} 
            className="cursor-pointer z-[60]" 
            anchor="top"
            // style={{zIndex: hoverItem && hoverItem.id == stopover.id ? 65  : 60 }}
            
          >
            <div 
                onClick={(e) => handelMarkerClick(e, stopover)}
                onMouseLeave={() => setActiveEntry(null) }
                onMouseOver={() => { activeTab == "stopover" ? "" : setActiveEntry(stopover); }}
                style={{ 
                    background: hoverItem && hoverItem.id == stopover.id ? 'yellow' : (bgColor ? `${bgColor}` : ""),
                }}
                className={`rounded-full ${ bgColor ? `bg-[${bgColor}]` : 'bg-red-500/75'} flex shadow-round p-[1px] align-center justify-center stopver-marker border-[1px] border-[#555]`}
            >
              <CircleDot size={10} className='bg-red-500/0 'opacity={0}/>
            </div>

            { (activeStopOver && activeStopOver['STOPOVER'] == stopover['STOPOVER']) ? <div className="radialRingWrapper z-[-1] pointer-events-none" onClick={() => handleClick(stopover)}>
                <div className="radialRing"></div>
            </div> : "" }
          </Marker>
        }) }

        {(!showDetailTab && activeStopOver) && 
                            <Popup
                            longitude={activeStopOver['COORDINATES'][1]}
                            latitude={activeStopOver['COORDINATES'][0]}
                            offset={[25,-15]}
                            anchor="left"
                            ref={popupRef}
                            onClose={() => console.log("Close")}
                            className="overflow-x-hidden stopover-content"
                        >
                                {/* <Popup
                                    latitude={activeStopOver['COORDINATES'][0]} 
                                    longitude={activeStopOver['COORDINATES'][1]} 
                                    offset={[15,15]} 
                                    anchor="left" 
                                    // closeOnMove={false}
                                    onClose={() => console.log("Close")}
                                    // closeOnClick={false}
                                    ref={popupRef}
                                    className="px-0 max-w-[300px] py-0 rounded-[1.2rem] stopover-content opacity-full"
                                > */}
                                    <Card setPopupInfo={() => {}} setActiveTab={setActiveTab} setShowDetailTab={setShowDetailTab} info={{...activeStopOver, category:"stopover"}}  index={0} items={[{...activeStopOver, category:"stopover"}]} setActiveItem={() => {}}>
                                        <div className="flex flex-col md:flex-col w-[300px]">
                                            <div className="w-full h-[200px] relative" style={{ background: (!activeStopOver['IMAGES'] || imgErr) ? '#000' : '#fff' }}>
                                                <a href="#">
                                                    {activeStopOver['IMAGES'] && <img className="w-full h-full object-cover"
                                                        src={activeStopOver['IMAGES']}
                                                        onError={() => setImgErr(true)}
                                                        alt="Sunset in the mountains" /> }
                                                    <div
                                                        onClick={(e) => { e.stopPropagation(); handleImageClick(activeStopOver['IMAGES'])}}
                                                        className="hover:bg-gray-900 transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-transparent opacity-25">
                                                    </div>
                                                </a>
                                            </div>
                                            <div className="md:w-full flex flex-col justify-center mb-5 mt-3">
                                                <div className="px-6">
                                                    <a href="#"
                                                        className="mt-1 font-medium text-xl inline-block hover:text-red-900 transition duration-500 ease-in-out my-2">
                                                            {language == "it" ?
                                                                `${activeStopOver['ITA_MAIN PLACE']} (${activeStopOver['ITA_STOPOVER']})` :
                                                                `${activeStopOver['MAIN PLACE']} (${activeStopOver['STOPOVER']})`
                                                            }
                                                        </a>
                                                

                                                    <div 
                                                    style={{ bordColor:voyageColorCards[activeStopOver['VOYAGE VARIANTS']]}}
                                                    className="text-xs bg-gray-200 px-4 py-1 w-fit text-black border border-cyan-900 mb-4 ml-[-5px] rounded-2xl" 
                                                        // style={{ backgroundColor:(VoyageColors[activeStopOver['VOYAGE VARIANTS']] || "gray")}}
                                                    >
                                                        <p className='span-1'>{t(activeStopOver['VOYAGE VARIANTS'])}</p>
                                                    </div>

                                                    <p className="text-gray-500 text-sm font-bold my-1">
                                                        {t('arrival day')}: <span className="text-rose-900">
                                                        {language == "it" ? (activeStopOver[`ITA_ARRIVAL DAY`] || activeStopOver["ARRIVAL DAY"]) : activeStopOver['ARRIVAL DAY'] || "N.A"}
                                                        </span>
                                                    </p>
                                                    <hr className="border-gray-300 my-2"/>
                                                    <p className="text-gray-500 text-sm font-bold my-1">
                                                        {t('departure day')}: <span className="text-rose-900">
                                                            {language == "it" ? (activeStopOver[`ITA_DEPARTURE DAY`] || activeStopOver['DEPARTURE DAY']) : activeStopOver['DEPARTURE DAY'] || "N.A"}
                                                        </span>
                                                    </p>
                                                    <hr className="border-gray-300 my-2"/>
                                                    <p className="text-gray-500 text-sm font-bold">
                                                        {t('duration')}: <span className="text-rose-900">{activeStopOver[`DURATION (days)`]}</span>
                                                        {/* Duration of stay (days) */}
                                                    </p>

                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                    
                                </Popup>}
      </>
    )
    
}



const getMarkerIcon = (category) => {
    switch(category) {
        case 'persons':
            return <Users size={15} color='#111'/>;
        case 'documents':
            return <Files size={15} color='#111'/>
        case 'institutions':
            return <School size={15} color='#111'/>
        case 'scientific_specimen':
            return <Bird  size={15} color='#111'/>
        default:
            return "";
    }
}


const Markers = ({ closeStopoverPopup,  items, setActiveItem, setActiveTab, handleImageClick, popupInfo, setPopupInfo, hoverItem, activeItem, setShowSpline, setShowDetailTab }) => {
    // const [popupInfo, setPopupInfo] = useState(null);

    const updateItem = (entry) => {
        let item = items.filter(p => p.COORDINATES).filter(p => p.COORDINATES.toString() == entry.COORDINATES.toString());
  
        setPopupInfo(item);
        setActiveItem(null);
        closeStopoverPopup()
    }

    let colors = {
        "stopovers":"red",
        "persons":"orange",
        "documents":"#5F9EA0",
        "institutions":"grey",
        "scientific_specimen":"green"
    }

    
    return(
        <>
            {(popupInfo && popupInfo.length) ? (
                <Popup
                    longitude={popupInfo[0]['COORDINATES'][1]}
                    latitude={popupInfo[0]['COORDINATES'][0]}
                    offset={[25,-15]}
                    anchor="left"
                    onClose={() => {setPopupInfo(null); setActiveItem(null)}}
                    className="overflow-x-hidden"
                >
                    <Card info={""} setActiveTab={setActiveTab} setShowDetailTab={setShowDetailTab} index={0} items={popupInfo} setActiveItem={setActiveItem} setPopupInfo={setPopupInfo}>
                        {popupInfo.map((info,i) => {
                            return (
                                <div className='w-full h-full' key={i + Math.random().toString()}>
                                { info.category == "persons" && <PersonCard handleImageClick={handleImageClick} info={info} key={i + Math.random().toString()} /> }
                                { info.category == "documents" && <DocumentCard handleImageClick={handleImageClick} info={info} key={i + Math.random().toString()} /> }
                                { info.category == "institutions" && <InstitutionCard handleImageClick={handleImageClick} info={info} key={i + Math.random().toString()} /> }
                                { info.category == "scientific_specimen" && <SpecimenCard handleImageClick={handleImageClick} info={info} key={i + Math.random().toString()} setShowSpline={setShowSpline} setActiveItem={setActiveItem} /> }
                                </div>
                            )
                        })}
                    </Card>

                    </Popup> ): ""
                }
            {items.filter(document => document['COORDINATES'] && document['COORDINATES'].length == 2)
            .filter(document => !document['COORDINATES'].includes("NaN"))
            .map((document,i) => {
                // console.log(document);
                let bgColor = colors[document.category];
                let [latitude, longitude] = document['COORDINATES'];
                return <Marker 
                    key={`${Math.random().toString()}-${i}`} 
                    latitude={latitude} longitude={longitude} 
                    className="cursor-pointer"
                    style={{
                        // zIndex: hoverItem && hoverItem.id == document.id ? 40 : (activeItem && activeItem.info && activeItem.info.id == document.id) ? 40 : "", 
                    }}
                    onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        updateItem(document)
                    }}
                >
                <div 
                    className={` ${ hoverItem && hoverItem.id == document.id ? `border-2 border-black bg-white` : bgColor} rounded-full flex shadow-md p-2 align-center justify-center`} 
                    style={{ 
                        backgroundColor: hoverItem && hoverItem.id == document.id ? 'white' : (activeItem && activeItem.info && activeItem.info.id == document.id) ? "white" : bgColor
                    }}
                >
                    {getMarkerIcon(document.category)}
                </div>
                </Marker>
            }) }
    </>)
}


const dataLayer =  {
    id: 'data',
    type: 'line',
    paint: {
      'line-color': ['get', 'color'],
      'line-dasharray': [0, 1, 1],
      'line-width':[
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        1.5,
        15,
        5
      ],
      'line-opacity': 1
    }
  };


//   MODAL links to iframes
// {(!showDetailTab && activeStopOver) && 
//     <Popup
//         latitude={activeStopOver['COORDINATES'][0]} 
//         longitude={activeStopOver['COORDINATES'][1]} 
//         offset={[15,15]} anchor="left" 
//         closeOnMove={false}
//         onClose={() => console.log("Close")}
//         // closeOnClick={false}
//         ref={popupRef}
//         className="px-0 max-w-[300px] py-0 rounded-[1.2rem]"
//     >
//         <Card setPopupInfo={() => {}} setActiveTab={setActiveTab} setShowDetailTab={setShowDetailTab} info={{...activeStopOver, category:"stopover"}}  index={0} items={[{...activeStopOver, category:"stopover"}]} setActiveItem={() => {}}>
//             <div className="flex flex-col md:flex-col w-[300px]">
//                 <div className="w-full h-[200px] relative" style={{ background: (!activeStopOver['IMAGES'] || imgErr) ? '#000' : '#fff' }}>
//                     <a href="#">
//                         {activeStopOver['IMAGES'] && <img className="w-full h-full object-cover"
//                             src={activeStopOver['IMAGES']}
//                             onError={() => setImgErr(true)}
//                             alt="Sunset in the mountains" /> }
//                         <div
//                             onClick={(e) => { e.stopPropagation(); setActiveImage(activeStopOver['IMAGES'])}}
//                             className="hover:bg-gray-900 transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-transparent opacity-25">
//                         </div>
//                     </a>
//                 </div>
//                 <div className="md:w-full flex flex-col justify-center mb-5 mt-3">
//                     <div className="px-6">
//                         <a href="#"
//                             className="mt-1 font-medium text-xl inline-block hover:text-red-900 transition duration-500 ease-in-out my-2">
//                                 {language == "it" ?
//                                     `${activeStopOver['ITA_MAIN PLACE']} (${activeStopOver['ITA_STOPOVER']})` :
//                                     `${activeStopOver['MAIN PLACE']} (${activeStopOver['STOPOVER']})`
//                                 }
//                             </a>
                    

//                         <div className="text-xs bg-gray-100 px-4 py-1 w-fit text-black border border-cyan-900 mb-4 ml-[-5px] rounded-2xl" 
//                             // style={{ backgroundColor:(VoyageColors[activeStopOver['VOYAGE VARIANTS']] || "gray")}}
//                         >
//                             <p className='span-1'>{activeStopOver['VOYAGE VARIANTS']}</p>
//                         </div>

//                         <p className="text-gray-500 text-sm font-bold my-1">
//                             Arrival: <span className="text-rose-900">17/03/1857</span>
//                         </p>
//                         <hr className="border-gray-300 my-2"/>
//                         <p className="text-gray-500 text-sm font-bold my-1">
//                             Departure: <span className="text-rose-900">31/03/1857</span>
//                         </p>
//                         <hr className="border-gray-300 my-2"/>
//                         <p className="text-gray-500 text-sm font-bold">
//                             Duration of stay (days): <span className="text-rose-900">15</span>
//                         </p>

//                     </div>
//                 </div>
//             </div>
//         </Card>
        
//     </Popup>}