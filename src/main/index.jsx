/* eslint-disable react/prop-types */
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import MainLayout from './MainLayout';
import MainMap from './MainMap';
import { getData } from '../services/data';
import CollapsibleTab from '../components/CollapsibleTab';
import { Bird, ChevronDown, ChevronUp, CircleDot, File, Files, Layers, LucideGitGraph, School, Users, X } from 'lucide-react';

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
import Carousel from '../components/Carousel';
import { useLocalization, useTranslation } from '../components/LocalizationProvider';
import ImageViewer from '../components/ImageViewer';
import { RiArrowDownLine, RiArrowDownSLine, RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import Charts from './charts';

dayjs.extend(customParseFormat);

const marks = {
    0:1856,
    24:1857,
    48:1858,
    72:1859,
    96:1860
}

const sliderValuesToDates = (values) => {
    let [min, max] = values;
    let minYear = 1856;

    let date = new Date(`${minYear}`).valueOf();
    // console.log(date);
    let minDate = new Date(date + 1317600000 * min);
    let maxDate = new Date(date + 1317600000 * max);

    // console.log(minDate.toISOString())
    // console.log(maxDate.toISOString());

    return [minDate, maxDate]
}

console.log(Novara);
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
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDataLoading, setIsDataLoading ] = useState(false);
    const [showSpline, setShowSpline] = useState(false);

    const { language } = useLocalization();
    const t = useTranslation();

    const [activeStopoverTab, setActiveStopoverTab] = useState("list");

    const [dateFilter, setDateFilter] = useState({
        minDate:new Date("1856"),
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
      allData:[]
    });

    const [value] = useDebounce(state.query, 1000);

    const mapRef = useRef(null);

    const handleStopoverClick = (stopOver) => {
        // flyto the location 
        if(mapRef.current) {
          mapRef.current.flyTo({ center: [...stopOver['COORDINATES']].reverse(), zoom:10 });
        }
    
        // update the stopover
        setActiveStopOver(stopOver);
        setActiveTab("stopovers");
        setActiveItem("");
        setActiveLink("");
        setLayerTabOpen(false);
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
        let resources = ["institutions", "persons", "scientific_specimen", "documents"];
        let allData = [];


        resources.forEach(resource => {
            let info = data[resource].map(entry => ({ ...entry, category:resource }));

            allData = [...allData, ...info];
        });

        allData = allData.map((entry, i) => ({id:i, ...entry}));

        setState((prevState) => ({...prevState, ...data, allData }));
        
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

        switch(tableName) {
          case 'persons':
            return !activeStopOver ? state.persons : state.persons.filter(person => {
              return (person['MAIN ENCOUNTER PLACE'] && person['MAIN ENCOUNTER PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACE'].toLocaleLowerCase());
            });
        
          case 'scientific_specimen':
            return !activeStopOver ? state.scientific_specimen : state.scientific_specimen.filter(inst => inst['MAIN PLACE']).filter(collection => {
              return (collection['MAIN PLACE'] && collection['MAIN PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACE'].toLocaleLowerCase());
            })
          case 'institutions':
            return !activeStopOver ? state.institutions : state.institutions.filter(inst => inst['Place']).filter(institution => {
              return (institution['Place'] && institution['Place'].toLocaleLowerCase() == activeStopOver['MAIN PLACE'].toLocaleLowerCase());
            })
          case 'documents':
            return !activeStopOver ? state.documents : state.documents.filter(doc => doc['TITLE / NAME']).filter(document => {
              return (document['MAIN COLLECTION PLACE'] && document['MAIN COLLECTION PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACE'].toLocaleLowerCase());
            })
          default:
            return [];
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
    
        mapRef.current.flyTo({
          center:[16.45, 39.76],
          zoom: 1.8
        });
    
      }

    const groupedStopOvers = targetStopOvers.reduce((a,b) => {
        let mainPlace = b['MAIN PLACE'];
        if(a[mainPlace]) {
            if(a[mainPlace].find(entry => entry['STOPOVER'] == b['STOPOVER'])) {
                return a;
            }
            a[mainPlace].push(b);
        } else {
            a[mainPlace] = [b];
        }

        return a;
    }, {});

    const tabClassName = `tab flex items-center px-1 font-semibold text-xs cursor-pointer hover:bg-gray-400 hover:text-white py-1`;
    
    return (
        <MainLayout>
            { isDataLoading && <div className='absolute z-[60] top-0 left-0 w-full bg-black/80 h-full flex items-center justify-center'>
                <div className=" bg-white p-2 rounded-md flex flex flex-col items-center">

                    <div className="loading-bar-background">
                        <div className="loading-bar" style={{ width: `${downloadProgress}%`}}></div>
                    </div>

                    Loading....
                </div>    
            </div>}
             {activeImage && <ImageViewer imageUrl={activeImage} alt="" className='rounded-md w-full object-cover h-full' showImage={false} onClose={() => setActiveImage(null)} />}
            <div className="map-container relative flex w-full">
           

            { activeStopOver ? <nav className="flex w-full absolute top-0 left-0 z-10 bg-white items-center justify-center" aria-label="Breadcrumb">
                 <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse p-2">
                        <li className="inline-flex items-center">
                            <a href="#" onClick={resetMap} className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dak:text-gray-400 dak:hover:text-white">
                                <svg className="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                                </svg>
                                {t('globe')}
                            </a>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <svg className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                </svg>
                                <a href="#" className="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dak:text-gray-400 dak:hover:text-white">
                                    {activeStopOver['MAIN PLACE']} <span className='text-red-300'>({activeStopOver['STOPOVER']})</span>
                                </a>
                            </div>
                        </li>
                    </ol>

                    <div className='toggler relative mx-5'>
                        <div className='flex cursor-pointer hover:bg-gray-100 focus:bg-gray-100 px-2 rounded-md border-[1px]' onClick={() => {setLayerTabOpen(!isLayerTabOpen)}}>
                            {t('type')}
                            <RiArrowDownSLine  className='ml-3'/>
                        </div>

                        { isLayerTabOpen && <div className="absolute top-12 bg-white">
                            {
                                ["institutions", "persons", "scientific_specimen", "documents"].map((item)  => {
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
                                                <div className={`${activeLayers.includes(item) ? 'bg-gray-300' : 'bg-gray-100' } p-1 rounded-full text-white`}>
                                                    {getMarkerIcon(item)}   
                                                </div>
                                                <span className='mx-2 capitalize'>{t(label) || label}</span>
                                            </label>                                            
                                        </div>
                                    )
                                })
                            }
                        </div> }
                        
                    </div>
                </nav> : "" }

                <div className="w-full">
                    <MainMap projection={"globe"} basemap={"daks"} ref={mapRef}>
                        {state.stopovers.length && <StopOVerMarkers stopovers={state.stopovers} handleImageClick={setActiveImage} handelClick={handleStopoverClick} activeStopOver={activeStopOver}/>}
                        <Source type="geojson" data={Novara}>
                            { <Layer {...dataLayer} /> }
                        </Source>

                        { activeStopOver  ? <Markers 
                            handleImageClick={setActiveImage}
                            hoverItem={hoverItem}
                            items={allData.filter(entry => activeLayers.includes(entry.category)).filter(entry => entry.stopover == activeStopOver['MAIN PLACE'])} 
                            setActiveItem={setActiveItem} 
                        /> : "" }

                        {activeStopOver ? 
                                <Popup
                                    latitude={activeStopOver['COORDINATES'][0]} 
                                    longitude={activeStopOver['COORDINATES'][1]} 
                                    offset={[15,15]} anchor="left" 
                                    closeOnMove={false}
                                    className="px-1 max-w-[300px] py-1"
                                >
                                    <div className="w-auto">
                                    <div className="flex items-cente gap-3 min-h-[100px]">
                                        <div className={`relative bg-gray-300 rounded-md min-w-[90px] h-inherit overflow-hidden`}>
                                            {/* <div className="h-full bg-orange w-full object-cover" style={{ backgroundImage:`url(${activeEntry['IMAGES']})`}}></div> */}
                                        {activeStopOver['IMAGES'] && <img src={activeStopOver['IMAGES']} alt="" className='object-fill h-full w-[90px]' />}
                                        </div>
                        
                                        <div className=''>
                                        <div className="fontsemibold">
                                            {language == "it" ?
                                                `${activeStopOver['ITA_MAIN PLACE']} (${activeStopOver['ITA_STOPOVER']})` :
                                                `${activeStopOver['MAIN PLACE']} (${activeStopOver['STOPOVER']})`
                                            }
                                        </div>
                                        <div className="text-gray-400 flex">
                                            {t('date')}: {
                                                language == "it" ? (activeStopOver['ITA_ARRIVAL DAY'] || activeStopOver['ARRIVAL DAY']) : activeStopOver['ARRIVAL DAY']
                                            } - {
                                                language == "it" ? (activeStopOver['ITA_DEPARTURE DAY'] || activeStopOver['DEPARTURE DAY']) : activeStopOver['DEPARTURE DAY']
                                            }
                                        </div>

                                        <div className="px-0">
                                            {t('duration')}: {activeStopOver['DURATION (days)']}
                                        </div>

                                        <div className="icon-box shadow-md p-2 rounded-md mt-1 min-w-[200px]" style={{ backgroundColor:(VoyageColors[activeStopOver['VOYAGE VARIANTS']] || "gray")}}>
                                            <p className='span-1'>{t(activeStopOver['VOYAGE VARIANTS'])}</p>
                                        </div>
                                        </div>
                                    </div>
                                    </div>
                                </Popup> : ""}
                    </MainMap>
                </div>

                <div className="tab-toggler absolute w-96 bg-white left-6 top-10 rounded-[10px] overflow-hidden z-20">
                    <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 w-full uppercase">
                        <li className="flex-1">
                            <a href="#" onClick={() => setActiveStopoverTab("list")} aria-current="page" 
                                className={`w-full inline-block p-2  ${ activeStopoverTab == "list" ? 'bg-gray-100 text-blue-600' : ''} rounded-t-lg active dak:bg-gray-800 dak:text-blue-500`}
                            >
                                {t('list')}
                            </a>
                        </li>
                        <li className="flex-1">
                            <a href="#"  onClick={() => setActiveStopoverTab("timeline")} 
                                className={`w-full inline-block p-2 ${ activeStopoverTab == "timeline" ? 'bg-gray-100 text-blue-600' : ''} rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dak:hover:bg-gray-800 dak:hover:text-gray-300`}
                            >
                                {t('timeline')}
                            </a>
                        </li>
                    </ul>
                </div>

                { activeStopoverTab == "timeline" ? <div className="absolute text-white left-6 top-20 timeline-section z-30 bg-[#2B222D] w-96 overflow-hidden rounded-[10px] border-[4px] border-[#AD9A6D]">
                    <div className="timeline-header p-4">
                        <div className="title font-semibold font-medium uppercase">
                            {t('stopovers')}

                            ({
                            [...stopovers]
                            .filter(stopover => stopover['ARRIVAL DAY'] !== "N.A.")
                            .filter(filterByDateRange).length
                            })
                        </div>
                        <div className="range-slider my-3">
                            {/* <RangeSlider className="bg-orange-400" id="range-slider"/> */}

                            <Slider 
                                range  
                                onChange={handleSliderChange} 
                                marks={marks}
                                step={2}
                                max={96}
                                defaultValue={[0, 96]}
                            />
                        </div>
                    </div>

                    <div className="timeline-body grid grid-cols-2 gap-2 p-6 h-[50vh] overflow-auto">
                        {
                            [...stopovers]
                                .filter(stopover => stopover['ARRIVAL DAY'] !== "N.A.")
                                .sort((a,b) => dayjs(a['ARRIVAL DAY'], ['DD/MM/YYYY', 'MMMM YYYY']).unix() - dayjs(b['ARRIVAL DAY'], ['DD/MM/YYYY', 'MMMM YYYY']).unix())
                                .filter(filterByDateRange)
                                .map((stopover,i) => (
                                    <div key={i} className='cursor-pointer text-white text-sm bg-white w-full relative' onClick={() => handleStopoverClick(stopover)}>
                                        <div className="absolute top-2 left-2 bg-black/20 text-black text-center uppercase p-1 text-xs font-normal">
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
                    className="stopover-cards absolute z-30 left-6 top-20 bg-white w-96 rounded-[10px] shadow-round border-[4px] border-[#AD9A6D]"
                >
                    

                    <div className="py-2 h-[65vh] w-full overflow-hidden">

                        <div className="p-4 py-2 uppercase font-medium">
                            <h5 className=''>{t('stopovers')} ({targetStopOvers.length})</h5>
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
                            <h5 className='capitalize'>{t('voyage_label')}</h5>
                            <select name="voyage" id="voyage"
                                defaultValue={""}
                                onChange={(e) => {
                                    setState({...state, activeVoyage:e.target.value});
                                }}
                                className='capitalize bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dak:bg-gray-700 dak:border-gray-600 dak:placeholder-gray-400 dak:text-white dak:focus:ring-blue-500 dak:focus:border-blue-500'
                            >
                                <option value="" >{t('all_voyages')}</option>
                                {(voyages.map((voyage, i) => (<option key={i}>{t(voyage)}</option>) ))}
                            </select>
                        </div>

                        <ul className="w-full h-[75%] overflow-y-auto overflow-x-hidden text-sm font-medium text-gray-900 rounded-none dak:bg-gray-700">
                            {
                                Object.keys(groupedStopOvers).map((mainPlace,i) => {
                                    if(groupedStopOvers[mainPlace].length > 1) {
                                        return (
                                        <Accordion title={mainPlace} key={mainPlace}>
                                            {
                                            groupedStopOvers[mainPlace].map(stopOver => {
                                                return (
                                                    <StopOverCard 
                                                        key={`${stopOver['STOPOVER']}-${i}`}  
                                                        stopOver={stopOver} 
                                                        onClick={() => handleStopoverClick(stopOver)} 
                                                        activeStopOver={activeStopOver} 
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
                                        />
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div> : ""}



                { activeStopOver ? 
                    <DetailTab 
                        setActiveStopOver={() => setActiveStopOver("")} 
                        setActiveTab={setActiveTab}
                        setHoverItem={setHoverItem}
                        data={allData.filter(entry => entry.stopover == activeStopOver['MAIN PLACE'])}
                        tableInfo={allData.filter(entry => entry.stopover == activeStopOver['MAIN PLACE']).filter(entry => entry.category == activeTab)}
                        activeTab={activeTab}
                        activeStopOver={activeStopOver}
                        setActiveLink={setActiveLink}
                        setActiveItem={setActiveItem}
                    /> : 
                    ""
                }
            
                <CollapsibleTab
                    collapseIcon={<Layers className="text-gray-500"/>}
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
                                        data={state[activeTable]} 
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
                    position="top-left"
                    collapseIcon={<LucideGitGraph className="text-gray-500"/>}
                    collapseClass="summary-cards absolute z-20 left-6 bottom-4  min-w-[40px] min-h-[40px]"
                >
                    <div className="space-x-0 py-2 flex px-3 bg-white rounded-[25px] shadow-round">
                    <div className="tab flex items-center px-1 cursor-pointer" onClick={() => {setIsSummaryClick(true); setActiveTable('scientific_specimen');}}>
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
                            <File size={20} color="cyan" />
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

                    <div className="tab flex items-center px-1 border-l cursor-pointer" onClick={() => {setIsSummaryClick(true); setActiveTable('institutions');}}>
                        <div className="icon mx-1">
                            <School size={20} color="gray" />
                        </div>
                        <div className="count flex flex-col items-center justify-between">
                        <span className="text-xs text-gray-500 font-semibold mb-[-5px] capitalize">{t('institutions')}</span>
                        <div className="text-xl font-bold text-gray-900 text-center w-full">
                            {
                            activeStopOver ?
                            state.institutions.filter(doc => doc['TITLE / NAME']).filter(institution => {
                                return (institution['MAIN PLACE'] && institution['MAIN PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACE'].toLocaleLowerCase());
                            }).length
                            : state.institutions.filter(instiution => instiution['INSTITUTION NAME']).length
                            }
                        </div>
                        </div>
                    </div>

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
                        items={allData.filter(entry => entry.category == activeItem.table)} 
                        setActiveItem={setActiveItem} setActiveLink={setActiveLink} 
                        isSpecimen={activeItem.table == "scientific_specimen"}
                        setShowSpline={setShowSpline}
                    />  }

                { ( showSpline && activeItem && activeItem.table == "scientific_specimen")  ? <SpecimenSplineModal activeItem={activeItem} setShowSpline={setShowSpline} /> : "" }
            </div>

            {activeLink ? <Modal activeTab={activeTab} isOpen={true} toggleActiveTable={setActiveLink}>
                <iframe src={encodeURI(activeLink)} width={"100%"} height={"100%"} target="_parent"></iframe>
            </Modal> : ""}
        </MainLayout>
    )
}

const Accordion = ({title, children}) => {
    const [isOpen, setIsOpen] = useState(true);

    return(
        <div className='accordion'>
            <button className='w-full flex justify-between bg-gray-0 p-2 rounded-md px-4 relative ml-6 w-[90%]' onClick={() => setIsOpen(!isOpen)}>
                {title}
                { isOpen ? <ChevronDown /> : <ChevronUp /> }

                <span className="absolute left-[-1px] top-[-5px]  h-[65%] bg-gray-500/50 w-[2px]"></span>
                <span className="absolute left-[-1px] top-5 bottom-0 h-[60%] bg-gray-500/50 w-[2px]"></span>
            </button>

            <div className={`${isOpen ? 'block' : 'hidden'} bg-gray-200/20`}>
                {children}
            </div>
        </div>
    )
}

const StopOverCard = ({stopOver, onClick, activeStopOver}) => {
    const t = useTranslation();
    const { language } = useLocalization();

    return (
        <li 
            className="w-full flex px-4 text-xs rounded-t-lg items-center cursor-pointer hover:bg-gray-200"
            onClick={onClick}
        >
            <div className="flex items-center flex-col relative h-full py-3">
                <div 
                    className={`${activeStopOver && activeStopOver['STOPOVER'] == stopOver['STOPOVER'] ? 'bg-green-800/40': 'bg-gray-400/20' } flex items-center justify-center rounded-full h-4 w-4`}
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
                {stopOver['ARRIVAL DAY'] && stopOver['ARRIVAL DAY'] !== "N.A." ? <div className='text-[11px] text-gray-400'>
                    {/* {stopOver['ARRIVAL DAY']} - {stopOver['DEPARTURE DAY']} */}
                    {
                        language == "it" ? (stopOver['ITA_ARRIVAL DAY'] || stopOver['ARRIVAL DAY']) : stopOver['ARRIVAL DAY']
                    } - {
                        language == "it" ? (stopOver['ITA_DEPARTURE DAY'] || stopOver['DEPARTURE DAY']) : stopOver['DEPARTURE DAY']
                    }
                </div> : ""}
            </div>                  
        </li>
    )
}

const DetailTab = ({ setActiveTab, setActiveStopOver, data, activeTab, setActiveItem, setHoverItem, tableInfo, activeStopOver, setActiveLink}) => {
    const t = useTranslation();
    return (
        <div className="absolute z-50 bg-[#F1F0EE] w-[450px] right-[20px] h-[80vh] top-10 rounded-xl shadow-lg border-[3px] border-[#AD9A6D] overflow-hidden">
            <div className="max-h-full h-full text-[#54595f] overflow-y-auto overflow-x-hidden bg-[#F8F1E5] ">
                <button className="absolute right-6 top-4 cursor-pointer rounded-full border-[#E9E4D8] border-[5px] p-1 bg-[#AD9A6D] text-[#E9E4D8]" onClick={() => setActiveStopOver()}>
                    <X size={22}/>
                </button>

                <div className="px-2 w-fit text-[24px] text-black w-full bg-white flex items-center py-4 rounded-xl">
                  <span className="font-semibold capitalize">{t('details')} ({data.length})</span>
                </div>

                <div className=" h-[88%]">
                    <div className="border-b border-gray-200 dak:border-gray-700">
                        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-styled-tab" data-tabs-toggle="#default-styled-tab-content" data-tabs-active-classes="text-purple-600 hover:text-purple-600 dak:text-purple-500 dak:hover:text-purple-500 border-purple-600 dak:border-purple-500" data-tabs-inactive-classes="dak:border-transparent text-gray-500 hover:text-gray-600 dak:text-gray-400 border-gray-100 hover:border-gray-300 dak:border-gray-700 dak:hover:text-gray-300" role="tablist">
                            {
                            ['stopovers', 'persons',  'institutions', 'scientific_specimen', 'documents'].map(tableName => {
                                return  (
                                <li key={tableName} className="mx-0" role="presentation">
                                    <button 
                                        onClick={() => setActiveTab(tableName)} 
                                        className={`${tableName == activeTab ? 'text-[#191919] border-[#191919] bg-[#AD9A6D]' : ''} capitalize inline-block py-3 px-1 border-b-2`}
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
                                activeTab == "stopovers" && 
                                    <ActiveItemInfoModal 
                                        isStopOver={true}
                                        popupInfo={activeStopOver} 
                                        setActiveItem={setActiveItem} 
                                        setActiveLink={setActiveLink}
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

const SpecimenSplineModal = ({ activeItem, setShowSpline }) => {
    return(
      <Modal activeTab={activeItem.info['NAME']} toggleActiveTable={() => setShowSpline(false)} isOpen={true}>
        <iframe 
            className="spline-canvas h-[80%] my-auto" src={`https://my.spline.design/${activeItem.info['SPLINE-CODE']}`} width="100%" frameBorder="0"></iframe>
      </Modal>
      
    )
  }

const ScientificCollectionModal = ({ popupInfo, setActiveItem, setActiveLink, setShowSpline }) => {
    const {language} = useLocalization();
    const t = useTranslation();

    const onLinkClick = (e) => {
        e.preventDefault();
        setActiveLink(e.target.href);
    }

    // console.log(popupInfo);
    // absolute right-0 top-[110px] rounded-xl border-[2px] border-[#000]
    return (
        <div 
            style={{ boxShadow:"0 -1px 20px 0 #ad9a6d"}} 
            className=" z-50 bg-[#f1f0ee] w-[450px] right-5 h-[70vh] detail-modal"
        >
            <div className="flex w-full px-[2%] py-5 max-h-full space-x-2 text-[#54595f] overflow-y-auto overflow-x-hidden ">
                <button 
                    className="absolute right-6 top-2 cursor-pointer rounded-full border-white border-[5px] p-1 bg-black text-white" 
                    onClick={() => setActiveItem(null)}
                >
                    <X size={22} className='font-bold'/>
                </button>
  
              <div className="general-info flex-1 h-full w-full max-w-full text-[#363636]">
                <div className="shadow-md rounded-full mb-4 border-[2px] px-5 w-fit min-w-20 border-black text-lg text-center uppercase">
                  <span className="font-semibold">{language == "it" ? popupInfo["ITA_SUBJECT"] : popupInfo['SUBJECT']}</span>
                </div>

                { 
                    popupInfo['SPLINE-CODE']  && 
                    <button className="absolute right-20 top-4 bg-gray-300 rounded-md px-2 capitalize" onClick={() => setShowSpline(true)}>{t('show spline')}</button>
                }
  
                <div className="content h-full">
                  <div className="header-section flex flex-col">
                    <h2 className="text-[#363636] mb-[20px] relative">
                        <strong className='font-bold  text-[1.4em]'>{language == "it" ? popupInfo["ITA_NAME"] : popupInfo['NAME']}</strong>
                        <span  className="ct-span ">
                            <p>
                            <em className="italic text-[1.4em]">{popupInfo['SCIENTIFIC NAME']}</em></p>
                        </span>

                        

                    </h2>

                    <div className="px-0 h-auto w-full">
                        {/* <img src={popupInfo['FEATURED IMAGE']} className="w-full"/> */}
                        <ImageViewer imageUrl={popupInfo['FEATURED IMAGE']} className="w-full" showImage={true} onClose={console.log}/>
                    </div>

                    <div className="font-semibold">
                        <h5 className="text-title text-[1.2em] text-[#ad9a6d]">
                            {/* Nomenclature adopted by the Novara scientists */}
                            {t('nomenclature_text')}
                        </h5>

                        <h5 className='text-title text-[#363636] text-[1.2em]'>
                            <em className="">{popupInfo['SCIENTIFIC NAME']}</em>
                        </h5>
                    </div>

                    <hr className='mt-3 border-black'/>
                    
  
                    {/* <h3 className="ct-headline text-xl color-dak mb-6 Nomenclature">
                      <span className="ct-span"><em className="italic">Ardea candidissima</em> Gmel.</span>
                    </h3> */}
  
                  </div>
  
                  <div className="body-section">
                    <div className="description my-[25px] text-[14px] text-gray-700">
                      <div>
                        {(language == "it" ? popupInfo['ITA_FROM THE SCIENTIFIC VOLUMES'] || "" : popupInfo['FROM THE SCIENTIFIC VOLUMES'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>))}
                      </div>
                    </div>

                    
                    <div className="summary-info bg-[#D4D4D4] flex-[0.6] p-[20px] rounded-[10px] h-full my-[16px]">
                        {/* <div className="py-0">
                            <h3 className="text-[24px] font-semibold">Details</h3>
                        </div> */}
    
        
                        <div className="info-section grid grid-cols-2 gap-2">
                            {
                            ['State of preservation', 'Collection date', 'Collection place',  'Inventory Number', 'Dimension', 'IUCN INDEX' ].map((field,i) => {
                                let colName = language == "it" ? `ITA_${field.toLocaleUpperCase()}` : field.toLocaleUpperCase();
                                return (
                                <div key={`${field}-${i}`} className="flex flex-col text-lg border-b border-[#ad9a6d] gap-2 items-start pt-2 text-sm w-full">
                                    <h4 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[17px] w-full">{t(field.toLocaleLowerCase().split(" ").join("_"))}</h4>
                                    <h5 className="capitalize text-[1.1em] mb-3">{popupInfo[colName] || popupInfo[field.toLocaleUpperCase()]}</h5>
                                </div>
                                )
                            })
        
                            }   

                            {/* 'Owner',  */}
                        </div>

                        <div className="flex flex-col text-lg gap-2 items-start py-2 text-sm w-full">
                            <h4 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full capitalize">{t('owner')}</h4>
                            <h5 className="capitalize text-[1.1em]">{popupInfo["OWNER"]}</h5>
                        </div>
                    </div>
  
                    <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full capitalize">{t('references')}</h3>
                    <div className="mt-[2px] mb-[25px] text-[14px] text-gray-700">
                        {popupInfo['REFERENCES'].split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>))}
                    </div>

                    <hr className='my-3 border-black mb-6'/>
  
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
    let itemIndex = items.findIndex(entry => entry.id == activeItem.info.id);
    const [currentIndex, setCurrentIndex] = useState(itemIndex);

    const nextIndex = () => {
        if(currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
        }
    }

    const prevIndex = () => {
        if(currentIndex == 0) {
            setCurrentIndex(items.length -1);
        } else {
            setCurrentIndex(currentIndex - 1);
        }
    }

    return (
        <div className='absolute right-0 top-[110px] max-h-[70vh] h-full border-[2px] border-[#000000] z-50 right-5 rounded-xl overflow-hidden'>
            {/* <Carousel items={items} currentIndex={currentIndex}> */}

                <button onClick={() => nextIndex()} className="carousel btn absolute z-10 top-[50%] right-0 bg-white text-black rounded-full p-1">
                    <RiArrowRightSLine />
                </button>
                <button onClick={() => prevIndex()} className="carousel btn absolute z-10 top-[50%] left-0 bg-white text-black rounded-full p-1">
                    <RiArrowLeftSLine />
                </button>


              
                { isSpecimen ? 
                    <ScientificCollectionModal 
                        popupInfo={items[currentIndex]} 
                        setActiveItem={setActiveItem} 
                        setActiveLink={setActiveLink} 
                        setShowSpline={setShowSpline}
                    /> :
                    <ActiveItemInfoModal 
                        popupInfo={items[currentIndex]} 
                        setActiveItem={setActiveItem} 
                        setActiveLink={setActiveLink}
                    /> 
                }
            {/* </Carousel> */}
        </div>
    );

}

const ActiveItemInfoModal = ({ popupInfo, setActiveItem, setActiveLink, isStopOver=false }) => {
    const t = useTranslation();
    const { language } = useLocalization();

    let colors = {
        "stopovers":"red",
        "persons":"orange",
        "documents":"cyan",
        "institutions":"grey",
        "scientific_specimen":"green"
    }


    let fields = {
        stopovers:['DEPATURE DAY', 'ARRIVAL DAY', 'DURATION (days)', 'VOYAGE VARIANTS', 'ANCHORAGE TYPOLOGY'],
        institutions:['Director', "Foundation date", "Nature", ],
        documents:["MAIN COLLECTION PLACE", "SECONDARY COLLECTION PLACE", "ALTERNATIVE TITLE / NAME", "ENGLISH TRANSLATION", "FIRST AUTHOR", "SECOND AUTHOR",
            "TRANSLATED BY", "EDITED BY", "KIND OF SOURCE", "MEDIUM", "MEASURES / QUANTITY / FORMAT", "LANGUAGE", "YEAR  / DATE", "PUBLISHER / PRINTER", 
            "PERIOD", "MAIN LOCAL INSTITUTION INVOLVED", "MAIN LOCAL PERSON INVOLVED", "COLLECTING MODE", "CURRENT OWNER", "COLLECTION"
        ],
        persons:["GENDER", "LIFE DATES", "COUNTRY OF BIRTH", "TITLE", "OCCUPATION", "OCCUPATION TYPOLOGY", "INSTITUTION TYPOLOGY", "INSTITUTION NAME", 
            "MAIN ENCOUNTER PLACE", "SECONDARY ENCOUNTER PLACE", "ENCOUNTER DATE", 
        ]
    }

    const onLinkClick = (e) => {
        e.preventDefault();
        setActiveLink(e.target.href);
    }

    // let description = (popupInfo['FROM THE SCIENTIFIC VOLUMES'] || popupInfo['ROLE DESCRIPTION'] || popupInfo['DESCRIPTION'] || "");
    const description = language == "it" ? 
        (popupInfo['ITA_FROM THE SCIENTIFIC VOLUMES'] || popupInfo['ITA_ROLE DESCRIPTION'] || popupInfo['ITA_DESCRIPTION'] || "") :
        (popupInfo['FROM THE SCIENTIFIC VOLUMES'] || popupInfo['ROLE DESCRIPTION'] || popupInfo['DESCRIPTION'] || "");


    let personsName = "";
    personsName += popupInfo['LAST NAME'] == "N. A." ? "" : popupInfo['LAST NAME'];
    personsName += popupInfo['FIRST NAME'] == "N. A." ? "" : " " + popupInfo['FIRST NAME'];

    return (
        <div 
            style={{boxShadow:  !isStopOver? "0 -1px 20px 0 #ad9a6d" : "" }}
            className={`detail-modal ${ !isStopOver ? 'overflow-y-auto h-full max-h-[70vh] w-[450px] rounded' : ''} bg-[#f1f0ee] `}
        >
            <div className={`flex w-full px-[2%] py-5 max-h-full ${ !isStopOver ? 'space-x-2' : ''} text-[#54595f] overflow-y-auto overflow-x-hidden`}>
  
              { !isStopOver ? <button className="absolute right-6 top-2 cursor-pointer rounded-full border-white border-[5px] p-1 bg-black text-white" onClick={() => setActiveItem(null)}>
                <X size={24} className='font-bold text-white' fontWeight={900}/>
              </button> : "" }

              
  
               <div className="general-info flex-1 h-full w-full max-w-full text-[#363636]">
               { (isStopOver && popupInfo['MAIN PLACE']) && <div className="border-b border-gray-300 w-full text-left text-xl">
                    { popupInfo['MAIN PLACE']} ({popupInfo['STOPOVER']})
                    { popupInfo['ARRIVAL DAY'] && popupInfo['ARRIVAL DAY'] !== "N.A." ? <div className='text-[12px] text-gray-400'>
                        {t('date')}: {popupInfo['ARRIVAL DAY']} - {popupInfo['DEPARTURE DAY']}
                    </div> : ""}
                </div> } 


                { popupInfo.category  && <div className="shadow-md rounded-full mb-4 mt-2 border-[1px] px-5 w-fit min-w-20 border-black text- text-center uppercase" style={{ borderColor: colors[popupInfo.category]}}>
                    <span className="font-semibold" >{popupInfo.category}</span>
                </div> }

                { language == "it" && 
                    <div  style={{ backgroundColor:(VoyageColors[popupInfo['VOYAGE VARIANTS']] || "gray")}} className='p-2 rounded-md my-2 text-title'>
                        {language == "it" ? popupInfo['ITA_VOYAGE VARIANTS'] : popupInfo['VOYAGE VARIANTS']}
                    </div> 
                }               
  
                <div className="content h-full">
                  <div className="header-section flex flex-col">
                    <h2 className="text-[#363636] text-[1.5em]">
                        <strong>{popupInfo['NAME'] || popupInfo['TITLE / NAME'] || (`${popupInfo['FIRST NAME'] ? personsName : "" }`) || popupInfo['INSTITUTION NAME']}</strong>
                        

                        {/* <span>
                            { language == "it" ? popupInfo['ITA_MAIN PLACE'] : popupInfo['MAIN PLACE']} ({ language == "it" ? popupInfo['ITA_MAIN PLACE'] : popupInfo['MAIN PLACE']})
                        </span> */}


                       
  
                    {/* <h3 className="ct-headline text-[#363636] mb-2 text-[1.3em] py-0"> */}
                      <span  className="ct-span">
                        <p>
                          <em className="italic">{popupInfo['SCIENTIFIC NAME']}</em></p>
                      </span>
                    </h2>

                    <div className="px-0 h-auto w-full">
                        {/* {popupInfo['FEATURED IMAGE'] && <img src={popupInfo['FEATURED IMAGE']} alt="" className='h-auto' />}
                        {popupInfo['IMAGE'] && <img src={popupInfo['IMAGE']} alt="" className='h-auto' />} */}

                        {popupInfo['FEATURED IMAGE'] && <ImageViewer imageUrl={popupInfo['FEATURED IMAGE']} alt="" className='h-auto' showImage={true} onClose={console.log}/>}
                        {popupInfo['IMAGE'] && <ImageViewer imageUrl={popupInfo['IMAGE']} alt="" className='h-auto' showImage={true} onClose={console.log}/>}
                        
                        {popupInfo['IMAGES'] && <ImageViewer imageUrl={popupInfo['IMAGES']} alt="" className='h-auto' showImage={true} onClose={console.log}/>}
                        
                        <figcaption className='my-3 text-sm'>
                            {language == "it" ? popupInfo['ITA_CAPTION'] : popupInfo['CAPTION']}
                        </figcaption>
                    </div>
                    <hr className='mt-3 border-black'/>
                    
  
                    {/* <h3 className="ct-headline text-xl color-dak mb-6 Nomenclature">
                      <span className="ct-span"><em className="italic">Ardea candidissima</em> Gmel.</span>
                    </h3> */}
  
                  </div>
                    

                  <div className="body-section">
                    <div className="description my-[25px] text-[14px] text-gray-700">
                      <div>
                        {(description && description !== "N. A.") ? description.split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>)) : ""}
                      </div>
                    </div>

                    
                    <div className="summary-info bg-[#D4D4D4] flex-[0.6] p-[20px] rounded-[10px] h-full my-[13px]">
                        {/* <div className="py-0">
                            <h3 className="text-[24px] font-semibold">Details</h3>
                        </div> */}
    
        
                        <div className="info-section grid grid-cols-1 gap-2">
                            {
                                fields[popupInfo.category || 'stopovers'].map((field,i) => {
                                    return (
                                        (popupInfo[field] && popupInfo[field] !== "N. A.") ? <div key={`${field}-${i}`} className="flex flex-col text-lg border-b border-[#ad9a6d] gap-2 items-start pt-0 text-sm w-full">
                                            <h4 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[17px] w-full capitalize">{t(field.toLocaleLowerCase()) || field}</h4>
                                            <h5 className="capitalize text-[1.1em] mb-3">{popupInfo[field] || "N.A"}</h5>
                                        </div> : ""
                                    )
                            })
        
                            }   
                        </div>
                    </div>

                    { (popupInfo['QUOTATION'] && popupInfo['QUOTATION'] !== "N. A.") ? <div className="description my-[25px] text-[14px] text-gray-700">
                        <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full capitalize">{t('quotation')}</h3>
                      <div>
                        {(popupInfo['QUOTATION'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>))}
                      </div>

                      <hr className='my-3 border-black'/>
                    </div> : "" }

                    { (popupInfo['RESOURCES'] && popupInfo['RESOURCES'] !== "N. A.") ? <div className="description my-[25px] text-[14px] text-gray-700">
                        <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full capitalize">{t('resources')}</h3>
                      <div>
                        {(popupInfo['RESOURCES'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>))}
                      </div>

                      <hr className='my-3 border-black'/>
                    </div> : "" }
                    
                    {(popupInfo['ROLE DESCRIPTION'] && popupInfo['ROLE DESCRIPTION'] !== "N. A.") ? <div className="description my-[25px] text-[14px] text-gray-700">
                        <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full">{t('role description')}</h3>
                        <div>
                            {
                                language == "it" ? (popupInfo['ITA_ROLE DESCRIPTION'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>)) :
                                (popupInfo['ROLE DESCRIPTION'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>)) 
                            }
                        </div>
                        <hr className='my-3 border-black'/>
                    </div> : ""}
  
                    {(popupInfo['REFERENCES'] || "") ?
                    <>
                    <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full">{t('references')}</h3>
                    <div className="mt-[2px] mb-[25px] text-[14px] text-gray-700">
                        {(popupInfo['REFERENCES'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>))}
                    </div>

                    <hr className='my-3 border-black'/> </>
                    : ""}
                        
                    {(popupInfo['LINKS'] || popupInfo["RESOURCES LINKS"] || popupInfo['RESOURCES LINK'] || "") ? 
                    <>
                    <h3 className="text-title text-[18px] text-[#ad9a6d] font-semibold capitalize">{t('links')}</h3>
                    <div className="pb-5 text-[14px] text-gray-700">
  
                      {
                        (popupInfo['LINKS'] || popupInfo["RESOURCES LINKS"] || popupInfo['RESOURCES LINK'] || "").split("\n").map((link,i) => (
                          <a className="my-3" href={link} key={`${link}-${i}`} onClick={onLinkClick}>
                            <span className="underline pointer-events-none">{link}</span>
                          </a>
                        ))
                      }
  
                    </div> 
                    <hr className='my-3 border-black'/>
                    </> : ""}
  
                  </div>
                </div>
            </div>              
        </div>
      </div>
    )
}


const StopOVerMarkers = ({ stopovers, handelClick, activeStopOver, handleImageClick }) => {
    const t = useTranslation();
    const { language } = useLocalization();
    const [activeEntry, setActiveEntry] = useState(null);
    // console.log(activeEntry);
    return(
      <>
        {stopovers.map((stopover,i) => {
          let [latitude, longitude] = stopover['COORDINATES'];
        //   console.log(latitude, longitude, stopover['STOPOVER']);

          return <Marker 
            key={`${stopover['MAIN PLACE']}-${i}`} 
            latitude={latitude} longitude={longitude} className="cursor-pointer" anchor="top"
            onClick={() => handelClick(stopover)}
          >
            <div 
                onMouseLeave={() => setActiveEntry(null) }
                onMouseOver={() => setActiveEntry(stopover)}
                className="rounded-full bg-red-500 flex shadow-round p-[1px] align-center justify-center stopver-marker z-10"
            >
              <CircleDot size={10} className='bg-red-500/0 'opacity={0}/>
            </div>

            { (activeStopOver && activeStopOver['STOPOVER'] == stopover['STOPOVER']) ? <div className="radialRingWrapper z-[-1]" onClick={() => handelClick(stopover)}>
                <div className="radialRing"></div>
            </div> : "" }
          </Marker>
        }) }
        {activeEntry ? 
          <Popup
            latitude={activeEntry['COORDINATES'][0]} 
            longitude={activeEntry['COORDINATES'][1]} 
            offset={[15,15]} anchor="left" 
            closeOnMove={false}
            className="px-1 max-w-[300px] py-1"
          >
            <div className="w-auto">
              <div className="flex gap-3 min-h-[100px]">
                <div className={`relative bg-gray-300 rounded-md min-w-[90px] h-inherit overflow-hidden`}>
                    {/* <div className="h-full bg-orange w-full object-cover" style={{ backgroundImage:`url(${activeEntry['IMAGES']})`}}></div> */}
                  {activeEntry['IMAGES'] && <img src={activeEntry['IMAGES']} alt="" onClick={() => handleImageClick(activeEntry['IMAGES'])} className='object-fill h-full w-[90px]' />}
                  {/* {activeEntry['IMAGES'] && <ImageViewer imageUrl={activeEntry['IMAGES']} className="object-fill h-full w-[90px]" />} */}
                </div>
  
                <div className='mr-2'>
                  <div className="fontsemibold">
                        {language == "it" ?
                            `${activeEntry['ITA_MAIN PLACE']} (${activeEntry['ITA_STOPOVER']})` :
                            `${activeEntry['MAIN PLACE']} (${activeEntry['STOPOVER']})`
                        }
                        
                    </div>
                  <div className="text-gray-400 flex">
                    {t('date')}: {activeEntry['DEPARTURE DAY']} - {activeEntry['ARRIVAL DAY']}
                  </div>

                  <div className="px-0">
                    {t('duration')}: {activeEntry['DURATION (days)']}
                  </div>

                  <div className="icon-box shadow-md p-2 rounded-md my-2" style={{ backgroundColor:(VoyageColors[activeEntry['VOYAGE VARIANTS']] || "gray")}}>
                    <p className='span-1'>{activeEntry['VOYAGE VARIANTS']}</p>
                  </div>
                </div>
              </div>
            </div>
          </Popup> : ""
        }
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


const Markers = ({ items, setActiveItem, handleImageClick, hoverItem}) => {
    const [popupInfo, setPopupInfo] = useState(null);

    const updateItem = (entry) => {
        let item = items.filter(p => p.COORDINATES).filter(p => p.COORDINATES.toString() == entry.COORDINATES.toString());
  
        setPopupInfo(item);
        setActiveItem(null);
    }

    let categoryFields = {
        persons:[
            {field:'GENDER', label:'Gender'},
            {field:'LIFE DATA', label:'Life Data'},
            {field:'BIRTH COUNTRY', label:'Birth Country'},
            {field:'TITLE', label:'TITLE'},
            {field:'OCCUPATION', label:'Occupation'},
            {field:'DATE', label:'Date Encounter'}
        ],
        scientific_specimen:[
            {field:'SUBJECT', label:' Subject '},
            {field:'COLLECTION PLACE', label:'Collection Place'},
            {field:'IUCN INDEX', label:'Indice IUCN'},
            {field:'COLLECTION DATE', label:'Collection Date'}
        ],
        institutions:[
            {field:'Place', label:'Place'},
            {field:'Director', label:'Director'},
            {field:'Foundation date', label:'Foundation date'}
        ],
        documents:[
            {field:'COLLECTING  MODE', label:'Collecting  Mode'},
            {field:'PLACE', label:'Place'},
            {field:'PERIOD', label:'Period'},
            {field:'YEAR / DATE', label:'Year/Date'}
        ]
        
    }

    let colors = {
        "stopovers":"red",
        "persons":"orange",
        "documents":"cyan",
        "institutions":"grey",
        "scientific_specimen":"green"
    }


    
    const t = useTranslation();
    
    // console.log(popupInfo);
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
                    <Carousel items={popupInfo}>
                        {popupInfo.map((info,i) => (
                        <div className="popup-content min-w-full bg-red-0 relative min-w-[300px] p-0" key={i}>
                           
                            <div className="h-0 w-12"></div>
                                
                                <div className="p-3">

                                    <div className="flex justify-between items-center">
                                        <h5 className="text-[#111] text-lg font-medium capitalize">
                                            {info['NAME'] || info['TITLE / NAME'] || info['FIRST NAME'] || info['INSTITUTION NAME']}
                                        </h5>

                                        <span style={{ backgroundColor:colors[info.category]}} className=" flex items-center h-5 mr-5 text-[#fff] text-xs font-medium px-2.5 rounded dak:bg-gray-700 dak:text-gray-300">
                                            {info['category']}
                                        </span>
                                    </div>
                                    

                                <div className="popup-content_inner">
                                    <div className="flex gap-3">
                                    {/* <div className="text-gray-400">ID {popupInfo['ID']} - Persons</div> */}
                                        <div className="relative bg-gray-300 rounded-md min-w-[90px] w-[90px] h-inherit overflow-hidden">
                                            {info['FEATURED IMAGE'] && <img src={info['FEATURED IMAGE']} alt="" className='rounded-md w-[90px] object-cover h-full' onClick={() => handleImageClick(info['FEATURED IMAGE'])} />}
                                            {info['IMAGE'] && <img src={info['IMAGE']} alt="" className='rounded-md w-full object-cover h-full' onClick={() => handleImageClick(info['IMAGE'])} />}

                                            {/* {info['FEATURED IMAGE'] && <ImageViewer imageUrl={info['FEATURED IMAGE']} alt="" className='rounded-md w-[90px] object-cover h-full' />}
                                            {info['IMAGE'] && <ImageViewer imageUrl={info['IMAGE']} alt="" className='rounded-md w-full object-cover h-full' />} */}

                                        </div>
                                   
                                        <div className='flex-1'>
                                            {
                                            categoryFields[info.category].map(field => (<div key={field.field} className="flex flex">
                                                <div className="mr-1 capitalize">{t(field.label.toLocaleLowerCase().trim()) || field.label}: </div>
                                                <div className="font-semibold">{info[field.field]}</div>
                                            </div>))
                                            }
                                        </div>

                                    </div>
                                    

                                    <div className="w-full flex justify-end mt-2 mb-1">
                                        <button className="bg-[#AD9A6D] text-white px-3 py-1 rounded-md" onClick={() => setActiveItem({ info:info, table:info.category })}>More Info</button>
                                    </div>
                                </div>
                                </div>
                            </div>
                        ))}
                        </Carousel>
                    </Popup> ): ""
                }
            {items.filter(document => document['COORDINATES'] && document['COORDINATES'].length == 2)
            .filter(document => !document['COORDINATES'].includes("NaN"))
            .map((document,i) => {
                // console.log(document);
                let bgColor = colors[document.category];
                let [latitude, longitude] = document['COORDINATES'];
                return <Marker 
                    key={`${document['TITLE / NAME']}-${i}`} 
                    latitude={latitude} longitude={longitude} 
                    className="cursor-pointer"
                    style={{zIndex: hoverItem && hoverItem.id == document.id ? 100 : "" }}
                    onClick={(e) => {
                    e.originalEvent.stopPropagation();
                        updateItem(document)
                    }}
                >
                <div 
                    className={` ${ hoverItem && hoverItem.id == document.id ? `border-2 border-black bg-white` : bgColor} rounded-full flex shadow-md p-2 align-center justify-center`} 
                    style={{ backgroundColor: hoverItem && hoverItem.id == document.id ? 'white' : bgColor}}
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