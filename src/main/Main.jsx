/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import MainLayout from "./MainLayout";
import MainMap from "./MainMap";
import { getData } from "../services/data";
import { Marker, Popup, Source, Layer } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import { Bird, BirdIcon, ChevronDown, ChevronsDown, CircleDot, File, Files, FilterIcon, HouseIcon, Layers, ListCollapse, LucideGitGraph, SquareLibrary, Table2Icon, User, Users, X } from "lucide-react";
import CollapsibleTab from "../components/CollapsibleTab";
import Modal from "../components/Modal";
import Table from "../components/Table";
import Grid from "../components/Grid";
import { columnNames } from "../components/constants";

import { Novara } from "./data";
import Carousel from "../components/Carousel";


export default function Main() {
  const [isLoaded, setIsLoadied] = useState(false)
  const [state, setState] = useState({
    persons:[],
    stopovers:[],
    lists:[],
    institutions:[],
    scientific_collection:[],
    documents:[],
    all_data:[],
    selleny_works:[],
  });

  const [activeLayers, setActiveLayers] = useState({
    persons:true,
    stopovers:true,
    institutions:true,
    scientific_collection:true,
    documents:true,
    novara_path:true
  });

  const mapRef = useRef(null);
  const [ activeStopOver, setActiveStopOver ] = useState(null);
  const [ activeTable, setActiveTable ] = useState(null);
  const [ isSummaryClick, setIsSummaryClick] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [ activeItem, setActiveItem] = useState(null);
  const [showSpline, setShowSpline] = useState(false);


  const handleStopoverClick = (stopOver) => {
    // flyto the location 
    if(mapRef.current) {
      mapRef.current.flyTo({ center: [...stopOver['COORDINATES']].reverse(), zoom:10 });
    }

    // update the stopover
    setActiveStopOver(stopOver);
    setActiveTab("persons");
  }

  const loadData = useCallback(async () => {
    let data = await getData();

    
    setState((prevState) => ({...prevState, ...data}));

    setIsLoadied(true);
  }, [setIsLoadied]);

  useEffect(() => {
    if(!isLoaded) {
      loadData();
    }
  }, [isLoaded, loadData]);


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

    mapRef.current.flyTo({
      center:[16.45, 39.76],
      zoom: 1.8
    });

  }

  const getActiveTableInfo = (tableName) => {
    switch(tableName) {
      case 'persons':
        return !activeStopOver ? state.persons : state.persons.filter(person => {
          return (person['MAIN ENCOUNTER PLACE'] && person['MAIN ENCOUNTER PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACES'].toLocaleLowerCase());
        });
    
      case 'scientific_collection':
        return !activeStopOver ? state.scientific_collection : state.scientific_collection.filter(inst => inst['MAIN PLACES']).filter(collection => {
          return (collection['MAIN PLACES'] && collection['MAIN PLACES'].toLocaleLowerCase() == activeStopOver['MAIN PLACES'].toLocaleLowerCase());
        })
      case 'institutions':
        return !activeStopOver ? state.institutions : state.institutions.filter(inst => inst['Place']).filter(institution => {
          return (institution['Place'] && institution['Place'].toLocaleLowerCase() == activeStopOver['MAIN PLACES'].toLocaleLowerCase());
        })
      case 'documents':
        return !activeStopOver ? state.documents : state.documents.filter(doc => doc['TITLE / NAME']).filter(document => {
          return (document['PLACE'] && document['PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACES'].toLocaleLowerCase());
        })
      case 'selleny_works':
        return state.documents.filter(doc => doc['TITLE / NAME']).filter(document => {
          return (document['PLACE'] && document['PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACES'].toLocaleLowerCase());
        })
      default:
        return [];
    }
  }

  const tabClassName = `tab flex items-center px-1 font-semibold text-xs cursor-pointer hover:bg-gray-400 hover:text-white py-1`;
  console.log(activeStopOver)
  return (
   <MainLayout>
    <div className="map-container relative">
      <button className="bg-red w-100 absolute top-5 z-10 bg-white left-[45%] px-4 py-2 shadow-md rounded-md" onClick={resetMap}>LEVEL 0NE</button>

      <div className="layer-toggler absolute z-10 bg-white right-0 top-20 m-4 rounded-md shadow-md">
        <h5 className="p-4 font-semibold">Layers</h5>
        <div className="grid">
          {['persons',  'institutions', 'scientific_collection', 'documents', 'novara_path'].map(layer =>{
            return (<div key={layer}>
              <label className="inline-flex items-center my-2 cursor-pointer mx-2" >
                <input 
                  type="checkbox" value="" 
                  className="sr-only peer" 
                  id={layer} 
                  defaultChecked={activeLayers[layer]} 
                  onChange={() => setActiveLayers({...activeLayers, [layer]:!activeLayers[layer]})}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dar:peer-focus:ring-blue-800 rounded-full peer dar:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dar:border-gray-600 peer-checked:bg-[#1A56AE]/90"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dar:text-gray-300 capitalize">{layer.split("_").join(" ")}</span>
              </label>
            </div>)
          })}
        </div>
      </div>

      <MainMap projection={"globe"} basemap={"darks"} ref={mapRef}>
          {state.stopovers.length && <StopOVerMarkers stopovers={state.stopovers} handelClick={handleStopoverClick} />}
          {
            (activeLayers['persons'] && activeStopOver && state.persons.length) && 
            <PersonsMarkers 
              setActiveItem={setActiveItem}
              persons={state.persons.filter(person => {
                return (person['MAIN ENCOUNTER PLACE'] && person['MAIN ENCOUNTER PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACES'].toLocaleLowerCase());
              })} 
            />
          }

          {
            (activeLayers['scientific_collection'] && activeStopOver && state.scientific_collection.length) && 
            <ScientificCollectionMarkers 
              setActiveItem={setActiveItem}
              collections={state.scientific_collection.filter(inst => inst['MAIN PLACES']).filter(collection => {
                return (collection['MAIN PLACES'] && collection['MAIN PLACES'].toLocaleLowerCase() == activeStopOver['MAIN PLACES'].toLocaleLowerCase());
              })} 
            />
          }


          {
            (activeLayers['documents'] && activeStopOver && state.documents.length) && 
            <DocumentsMarkers 
              setActiveItem={setActiveItem}
              documents={state.documents.filter(doc => doc['TITLE / NAME']).filter(document => {
                return (document['PLACE'] && document['PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACES'].toLocaleLowerCase());
              })} 
            />
          }

          {
            (activeLayers['institutions'] && activeStopOver && state.institutions.length) && 
            <InstitutionMarkers 
              setActiveItem={setActiveItem}
              institutions={state.institutions.filter(inst => inst['Place']).filter(institution => {
                return (institution['Place'] && institution['Place'].toLocaleLowerCase() == activeStopOver['MAIN PLACES'].toLocaleLowerCase());
              })} 
            />
          }

        <Source type="geojson" data={Novara}>
          { activeLayers['novara_path'] && <Layer {...dataLayer} /> }
        </Source>

      </MainMap>

      { 
        activeTable && <Modal activeTab={activeTable} isOpen={true} toggleActiveTable={setActiveTable}>
          {/* <Table data={state[activeTable]} columnNames={[]} columnMapping={{}}/> */}
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
          
        </Modal>
      }


        {
          activeItem ? activeItem.table == "scientific_collection" ? 
          <ScientificCollectionModal popupInfo={activeItem.info} setActiveItem={setActiveItem}/>
          : <div className="table-section absolute z-50 bg-white w-[30vw] right-0 h-full right-0 top-0 rounded--l-md shadow-md">
            <div className="w-full px-5 py-10 max-h-full space-x-2 text-[#54595f] overflow-y-auto overflow-x-hidden ">

              <button className="absolute right-10 top-4 cursor-pointer" onClick={() => setActiveItem(null)}>
                <X />
              </button>

              <div className="my-3">
                <h5 className="text-xl capitalize font-semibold">{activeItem.table.split("_").join(" ")}</h5>
              </div>

              <div className="grid grid-cols-2">
                  {Object.keys(activeItem.info).filter(key => key && key !== "__EMPTY").map(key => (
                    <div key={key} className="my-2">
                      <div className="capitalize font-semibold">{key.toLocaleLowerCase()}</div>
                      <div className="text-sm my-2 break-all text-gray-400">
                        <p>{activeItem.info[key]}</p>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          </div> : ""
        }
      

      
      <CollapsibleTab
        position="top-left"
        collapseIcon={<ListCollapse className="text-gray-500"/>}
        collapseClass="stopover-cards absolute z-20 left-6 top-6 bg-white w-72 rounded-md shadow-round "
      >
        <div className="py-7 h-[70vh] w-full">
          <ul className="w-full h-full overflow-y-auto text-sm font-medium text-gray-900 rounded-none dar:bg-gray-700">
              {
                state.stopovers.map((stopOver,i) => {
                  return (<li 
                    key={`${stopOver['MAIN PLACES']}-${i}`} 
                    className="w-full flex px-4 text-xs rounded-t-lg items-center cursor-pointer hover:bg-gray-200"
                    onClick={() => handleStopoverClick(stopOver)}
                  >
                    <div className="flex items-center flex-col relative h-full py-3">
                      <div 
                        className={`${activeStopOver && activeStopOver['MAIN PLACES'] == stopOver['MAIN PLACES'] ? 'bg-green-800/40': 'bg-gray-400/20' } flex items-center justify-center rounded-full h-4 w-4`}
                      >
                        <div className={`${activeStopOver && activeStopOver['MAIN PLACES'] == stopOver['MAIN PLACES'] ? 'bg-green-800' : 'bg-gray-500'}  w-1 h-1 rounded-full`}></div>
                      </div>

                      <span className="absolute top-5 bottom-0 h-full bg-gray-500/50 w-[2px]"></span>
                    </div>

                    <div className="border-b border-gray-300 w-full text-left px-3 py-3">
                      {stopOver['MAIN PLACES']}
                    </div>                  
                  </li>)
                })
              }
          </ul>
        </div>
      </CollapsibleTab>

      

      <CollapsibleTab
        position="top-left"
        collapseIcon={<LucideGitGraph className="text-gray-500"/>}
        collapseClass="summary-cards absolute z-20 left-6 bottom-5  min-w-[40px] min-h-[40px]"
      >
        <div className="space-x-8 py-3 flex px-3 pl-6 bg-white rounded-[25px] shadow-round">
          <div className="tab flex items-center px-1 cursor-pointer" onClick={() => {setIsSummaryClick(true); setActiveTable('scientific_collection');}}>
              <div className="icon mx-1">
                <Bird size={30} color="#4AB46C"/>
              </div>
              <div className="count flex flex-col items-center relative h-full">
                <span className="text-xs text-gray-500 font-semibold mb-[-5px]">Scientific Specimen</span>
                <div className="text-xl font-bold text-gray-900 text-center w-full">
                  {
                    activeStopOver ?
                    state.scientific_collection.filter(inst => inst['MAIN PLACES']).filter(institution => {
                      return (institution['MAIN PLACES'] && institution['MAIN PLACES'].toLocaleLowerCase() == activeStopOver['MAIN PLACES'].toLocaleLowerCase());
                    }).length
                    : state.scientific_collection.length
                  }
                </div>
              </div>
          </div>

          <div className="tab flex items-center px-1 border-l cursor-pointer" onClick={() => {setIsSummaryClick(true); setActiveTable('documents');}}>
              <div className="icon mx-1">
                <File size={30} color="#4AB46C" />
              </div>
              <div className="count flex flex-col items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold mb-[-5px]">Docs</span>
              <div className="text-xl font-bold text-gray-900 text-center w-full">
                {
                  activeStopOver ?
                  state.documents.filter(doc => doc['TITLE / NAME']).filter(document => {
                    return (document['PLACE'] && document['PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACES'].toLocaleLowerCase());
                  }).length
                  : state.documents.filter(doc => doc['TITLE / NAME']).length
                }
              </div>
              </div>
          </div>

          <div className="tab flex items-center px-1 border-l cursor-pointer" onClick={() => {setIsSummaryClick(true); setActiveTable('persons');}}>
              <div className="icon mx-1">
                <Users size={30} color="#4AB46C" />
              </div>
              <div className="count flex flex-col items-center">
                <span className="text-xs text-gray-500 font-semibold mb-[-5px]">Persons</span>
                <span className="text-xl font-bold text-gray-900 text-center w-full">
                  { activeStopOver ? 
                    state.persons.filter(person => (person['MAIN ENCOUNTER PLACE'] && person['MAIN ENCOUNTER PLACE'].toLocaleLowerCase() == activeStopOver['MAIN PLACES'].toLocaleLowerCase()) ).length :
                    state.persons.length
                  }
                </span>
              </div>
          </div>
        </div>
        
      </CollapsibleTab>


      <CollapsibleTab
        collapseIcon={<Layers className="text-gray-500"/>}
        collapseClass="layer-cards absolute z-20 left-0 right-0 mx-auto w-[500px] bottom-0 min-w-[40px] min-h-[40px]"
      >
        <div className="flex space-x-2 py-3 flex px-3 bg-white/40 rounded-t-[5px] shadow-round">
          <div className={tabClassName} onClick={() => toggleActiveTable("stopovers")}>Stop Overs</div>
          <div className={tabClassName} onClick={() => toggleActiveTable("persons")}>Persons</div>
          <div className={tabClassName} onClick={() => toggleActiveTable("documents")}>Documents</div>
          <div className={tabClassName} onClick={() => toggleActiveTable("scientific_collection")}>Scientific Specimen</div>
          <div className={tabClassName} onClick={() => toggleActiveTable("institutions")}>Institutions</div>
          {/* <div className={tabClassName} onClick={() => toggleActiveTable("guide")}>Guide</div> */}
        </div>
       
      </CollapsibleTab>

      
      <CollapsibleTab
        position="top-right"
        collapseIcon={<Table2Icon className="text-gray-500"/>}
        collapseClass="filter-card absolute z-20 bg-white w-[500px] right-6 top-6 bg-white/60 rounded-md shadow-round "
      >
        { activeStopOver && <div className="h-[70vh] w-full overflow-y-auto">

          <div className="mb-4 border-b border-gray-200 dar:border-gray-700">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-styled-tab" data-tabs-toggle="#default-styled-tab-content" data-tabs-active-classes="text-purple-600 hover:text-purple-600 dar:text-purple-500 dar:hover:text-purple-500 border-purple-600 dar:border-purple-500" data-tabs-inactive-classes="dar:border-transparent text-gray-500 hover:text-gray-600 dar:text-gray-400 border-gray-100 hover:border-gray-300 dar:border-gray-700 dar:hover:text-gray-300" role="tablist">
                {
                  ['persons',  'institutions', 'scientific_collection', 'documents'].map(tableName => {
                    return  (
                      <li key={tableName} className="mx-1" role="presentation">
                          <button 
                            onClick={() => setActiveTab(tableName)} 
                            className={`${tableName == activeTab ? 'text-purple-600 border-purple-600' : ''} capitalize inline-block py-3 px-1 border-b-2 rounded-t-lg`}
                            id="profile-styled-tab"
                            data-tabs-target="#styled-profile" 
                            type="button" 
                            role="tab" 
                            aria-controls="profile" 
                            aria-selected="true"
                          >
                            {tableName.split("_").join(" ")}
                          </button>
                      </li>
                    )
                  })
                }
              </ul>
          </div>

          <div className="py-3 px-3 w-full">
            { 
              ['persons',  'institutions', 'scientific_collection', 'documents'].map(tableName => {
                return (activeTab == tableName) && <Table 
                  key={tableName} 
                  tableName={tableName} 
                  setActiveItem={setActiveItem}
                  data={getActiveTableInfo(tableName)} 
                  columnNames={columnNames[tableName]} columnMapping={{}} 
                /> 
              })
            }
          </div>
        </div> 
        }
        
          <div className="py-3 px-3 h-[70vh] w-full hidden">
            <div className="header py-5 px-2">
              <h5 className="text-[#1A56AE] font-semibold">Advanced Filtering</h5>
            </div>

            <div className="cards">
              <div className="row w-full space-x-2 flex">
                <div className="card bg-white w-full h-16"></div>
                <div className="card bg-white w-full h-16" ></div>
              </div>
                
              <div className="row w-full space-x-2 flex my-2">
                <div className="card bg-white w-full h-16"></div>
                <div className="card bg-white w-full h-16" ></div>
                <div className="card bg-white w-full h-16" ></div>
              </div>

              <div className="row w-full space-x-2 flex my-2">
                <div className="card bg-white w-full h-16"></div>
              </div>
              
            </div>

            <hr className="bg-black my-5 border-black"/>
            
            <div className="">
              <div className="result-list">
                  <h5 className="text-[#1A56AE] font-semibold">Results</h5>
                  <ul className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-none dar:bg-gray-700 dar:border-gray-600 dar:text-white">
                      <li className="w-full px-4 py-2 border-b border-gray-200 rounded-t-lg dar:border-gray-600">Profile</li>
                      <li className="w-full px-4 py-2 border-b border-gray-200 dar:border-gray-600">Settings</li>
                      <li className="w-full px-4 py-2 border-b border-gray-200 dar:border-gray-600">Messages</li>
                      <li className="w-full px-4 py-2 rounded-b-lg">Download</li>
                  </ul>
              </div>
              <div className="pagination">

              </div>
            </div>
        </div>
      </CollapsibleTab>
    </div>
   </MainLayout>
  )
}

const StopOVerMarkers = ({ stopovers, handelClick }) => {
  const [activeEntry, setActiveEntry] = useState(null);

  return(
    <>
      {stopovers.map((stopover,i) => {
        let [latitude, longitude] = stopover['COORDINATES'];
        return <Marker 
          key={`${stopover['MAIN PLACES']}-${i}`} 
          latitude={latitude} longitude={longitude} className="cursor-pointer" anchor="top"
          onClick={() => handelClick(stopover)}
        >
          <div 
            onMouseLeave={() => setActiveEntry(null) }
            onMouseOver={() => setActiveEntry(stopover)}
            className="rounded-full bg-white/40 flex shadow-round p-2 align-center justify-center"
          >
            <CircleDot size={18} color="green" fill="white"/>
          </div>
        </Marker>
      }) }
      {activeEntry && 
        <Popup 
          latitude={activeEntry['COORDINATES'][0]} 
          longitude={activeEntry['COORDINATES'][1]} 
          offset={[10,-15]} anchor="left" 
          focusAfterOpen={false}
          className="px-2"
        >
          <div className="px-2 w-auto">

            <div className="flex items-center">
              <div className="flex items-center flex-col relative h-full py-3">
                <div className={'bg-green-800/20 flex items-center justify-center rounded-full h-5 w-5 mr-2'}>
                  <div className={'bg-green-800 w-1 h-1 rounded-full'}></div>
                </div>
              </div>

              <div>
                <div className="fontsemibold">{activeEntry['MAIN PLACES']}</div>
                <div className="text-gray-400 flex">
                  {activeEntry['TYPE OF ANCHORAGE']}, {activeEntry['ARRIVAL DAY']}
                </div>
              </div>
            </div>
          </div>
        </Popup>
      }
    </>
  )
  
}

const PersonsMarkers = ({ persons, setActiveItem }) => {
  let fields = [
    {field:'GENDER', label:'Gender'},
    {field:'LIFE DATA', label:'Life Data'},
    {field:'BIRTH COUNTRY', label:'Birth Country'},
    {field:'TITLE', label:'TITLE'},
    {field:'OCCUPATION', label:'Occupation'},
    {field:'DATE', label:'Date Encounter'}
  ];

  const [popupInfo, setPopupInfo] = useState(null);


  const updatePersons = (person) => {
    let tPersons = persons.filter(p => p.COORDINATES.toString() == person.COORDINATES.toString());
    setPopupInfo(tPersons);
  }

  return(
    <>
      {popupInfo && (
          <Popup
            longitude={popupInfo[0]['COORDINATES'][1]}
            latitude={popupInfo[0]['COORDINATES'][0]}
            offset={[25,-15]}
            anchor="left"
            focusAfterOpen={false}
            onClose={() => setPopupInfo(null)}
            className="overflow-x-hidden w-[300px]"
          >
             <Carousel >
              {popupInfo.map((info,i) => (
                <div className="popup-content min-w-full bg-red-0" key={i}>
                  <div className="px-3 h-16 w-12">
                  </div>
                  
                  <div className="p-2">
                    <h5 className="text-[#1A56AE] text-lg font-semibold">{info['FIRST NAME']} {info['LAST NAME']}</h5>

                    <div className="popup-content_inner">
                      <div className="flex">
                        <div className="text-gray-400">ID {info['ID']} - Persons</div>
                      </div>

                      {
                        fields.map(field => (<div key={field.field} className="flex">
                        <div className="mr-1">{field.label}: </div>
                        <div className="font-semibold">{info[field.field]}</div>
                      </div>))
                      }

                      <div className="w-full flex items-center justify-center mt-2">
                        <button className="bg-[#1A56AE] text-white px-3 py-1 rounded-md cursor-pointer" onClick={() => setActiveItem({ info:info, table:'persons' })}>More Info</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>




            {/* <div className="popup-content">
                <div className="px-3 h-16 w-12">
                </div>
                
                <div className="p-2">
                  <h5 className="text-[#1A56AE] text-lg font-semibold">{popupInfo['FIRST NAME']} {popupInfo['LAST NAME']}</h5>

                  <div className="popup-content_inner">
                    <div className="flex">
                      <div className="text-gray-400">ID {popupInfo['ID']} - Persons</div>
                    </div>

                    {
                      fields.map(field => (<div key={field.field} className="flex">
                      <div className="mr-1">{field.label}: </div>
                      <div className="font-semibold">{popupInfo[field.field]}</div>
                    </div>))
                    }

                    <div className="w-full flex items-center justify-center mt-2">
                      <button className="bg-[#1A56AE] text-white px-3 py-1 rounded-md" onClick={() => setActiveItem({ info:popupInfo, table:'persons' })}>More Info</button>
                    </div>
                  </div>
                </div>
              </div> */}
          </Popup>)
      }

      {
      persons.filter(person => person['COORDINATES'])
      .filter(person => !person['COORDINATES'].includes("NaN"))
      .map((person,i) => {

        let [latitude, longitude] = person['COORDINATES'];
        return <Marker 
            key={`${person['PLACE']}-${i}`} 
            latitude={latitude} 
            longitude={longitude} 
            className="cursor-pointer"
            onClick={e => {
              console.log("Click")
              e.originalEvent.stopPropagation();
             updatePersons(person);
            }}
          >
          <div className="rounded-full bg-gray-100/80 flex shadow-md p-2 align-center justify-center">
            <User color="#1A56AE" size={12} />
          </div>
        </Marker>
      }) }
    </>
  )
  
}

const DocumentsMarkers = ({ documents, setActiveItem }) => {
  let fields = [
    {field:'COLLECTING  MODE', label:'Collecting  Mode'},
    {field:'PLACE', label:'Place'},
    {field:'PERIOD', label:'Period'},
    {field:'YEAR / DATE', label:'Year/Date'}
  ];

  const [popupInfo, setPopupInfo] = useState(null);

  const updateDocument = (document) => {
      let tDocuments = documents.filter(p => p.COORDINATES.toString() == document.COORDINATES.toString());

      console.log(tDocuments);
      setPopupInfo(tDocuments);
      setActiveItem(null);
  }

  return(
    <>
      {popupInfo && (
          <Popup
          longitude={popupInfo[0]['COORDINATES'][1]}
          latitude={popupInfo[0]['COORDINATES'][0]}
          offset={[25,-15]}
          anchor="left"
          focusAfterOpen={false}
          onClose={() => {setPopupInfo(null); setActiveItem(null)}}
          className="overflow-x-hidden w-[300px]"
        >
           <Carousel >
            {popupInfo.map((info,i) => (
              <div className="popup-content min-w-full bg-red-0" key={i}>
                    <div className="px-3 h-0 w-12">
                    </div>
                    
                    <div className="p-2">
                      <h5 className="text-[#1A56AE] text-lg font-semibold py-4">{info['TITLE / NAME']}</h5>

                      <div className="popup-content_inner">
                        <div className="flex">
                          {/* <div className="text-gray-400">ID {popupInfo['ID']} - Persons</div> */}
                        </div>

                        {
                          fields.map(field => (<div key={field.field} className="flex">
                          <div className="mr-1">{field.label}: </div>
                          <div className="font-semibold">{info[field.field]}</div>
                        </div>))
                        }

                        <div className="w-full flex items-center justify-center mt-2">
                          <button className="bg-[#1A56AE] text-white px-3 py-1 rounded-md" onClick={() => setActiveItem({ info:info, table:'persons' })}>More Info</button>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </Carousel>
          </Popup>)
      }

      {
      documents.filter(document => document['COORDINATES'])
      .filter(document => !document['COORDINATES'].includes("NaN"))
      .map((document,i) => {

        let [latitude, longitude] = document['COORDINATES'];
        return <Marker 
            key={`${document['TITLE / NAME']}-${i}`} 
            latitude={latitude} longitude={longitude} 
            className="cursor-pointer"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              updateDocument(document)
            }}
        >
          <div className="rounded-full bg-gray-100/80 flex shadow-md p-2 align-center justify-center">
            <Files color="#1A56AE" size={12} />
          </div>
        </Marker>
      }) }
    </>
  )
  
}

const InstitutionMarkers = ({ institutions, setActiveItem }) => {
  let fields = [
    {field:'Place', label:'Place'},
    {field:'Director', label:'Director'},
    {field:'Foundation date', label:'Foundation date'}
  ];

  const [popupInfo, setPopupInfo] = useState(null);
  return(
    <>
      {popupInfo && (
          <Popup
            longitude={popupInfo['COORDINATES'][1]}
            latitude={popupInfo['COORDINATES'][0]}
            offset={[25,-15]}
            anchor="left"
            focusAfterOpen={false}
            onClose={() => {setPopupInfo(null); setActiveItem(null);}}
          >
           
            <div className="popup-content">
                <div className="px-3 h-0 w-12"></div>
                
                <div className="p-2">
                  <h5 className="text-[#1A56AE] text-lg font-semibold py-4">{popupInfo['INSTITUTION NAME']}</h5>

                  <div className="popup-content_inner">
                    <div className="flex">
                    </div>

                    {
                      fields.map(field => (<div key={field.field} className="flex">
                      <div className="mr-1">{field.label}: </div>
                      <div className="font-semibold">{popupInfo[field.field]}</div>
                    </div>))
                    }

                    <div className="w-full flex items-center justify-center mt-2">
                      <button className="bg-[#1A56AE] text-white px-3 py-1 rounded-md" onClick={() => setActiveItem({ info:popupInfo, table:'institution' })}>More Info</button>
                    </div>
                  </div>
                </div>
              </div>
          </Popup>)
      }

      {institutions.filter(inst => inst['COORDINATES']).map((institution,i) => {
        let [latitude, longitude] = institution['COORDINATES'];
        return <Marker 
          key={`${institution['PLACE']}-${i}`} 
          latitude={latitude} 
          longitude={longitude} 
          className="cursor-pointer"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setPopupInfo(institution);
            setActiveItem(null);
          }}
        >
           <div className="rounded-full bg-gray-200/80 flex shadow-md p-2 align-center justify-center">
            <HouseIcon color="#1A56AE" size={12} />
          </div>
        </Marker>
      }) }
    </>
  )
  
}



const ScientificCollectionMarkers = ({ collections, setActiveItem }) => {
  let fields = [
    {field:' Subject ', label:' Subject '},
    {field:'Collection Place', label:'Collection Place'},
    {field:'Indice IUCN', label:'Indice IUCN'},
    {field:'Collection date', label:'Collection Date'}
  ];

  const [popupInfo, setPopupInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleInfoModal = () => {
    setIsModalOpen(!isModalOpen);
  }

  return(
    <>
      {popupInfo && (
          <Popup
            longitude={popupInfo['COORDINATES'][1]}
            latitude={popupInfo['COORDINATES'][0]}
            offset={[25,-15]}
            anchor="left"
            focusAfterOpen={false}
            onClose={() => setPopupInfo(null)}
          >
            <div className="popup-content">
                <div className="px-3 h-auto w-full">
                  <img src={popupInfo['Featured Images']} className="w-full mt-3"/>
                </div>
                
                <div className="p-2">
                  <h5 className="text-[#1A56AE] text-lg font-semibold">{popupInfo['COMMON NAME']}</h5>

                  <div className="popup-content_inner">
                    <div className="flex">
                      <div className="text-gray-400">ID {popupInfo['Inventory Number']} - Bird</div>
                    </div>

                    {
                      fields.map((field,i) => (<div key={`${field.field}-${i}`} className="flex">
                      <div className="mr-1">{field.label}: </div>
                      <div className="font-semibold">{popupInfo[field.field]}</div>
                    </div>))
                    }
                  </div>

                  <div className="w-full flex items-center mt-5" onClick={() => setActiveItem({info:popupInfo, table:'scientific_collection'})}>
                    <button className="bg-[#1A56AE] text-white px-3 py-1 rounded-lg mx-auto w-20">More Info</button>
                  </div>
                  
                </div>
              </div>
          </Popup>)
      }

      {collections.filter(inst => inst['COORDINATES']).map((collection,i) => {
        let [latitude, longitude] = collection['COORDINATES'];
        return <Marker 
            key={`${collection['PLACE']}-${i}`} 
            latitude={latitude} 
            longitude={longitude} 
            className="cursor-pointer" 
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo(collection)
            }}
        >
           <div className="rounded-full bg-gray-200/80 flex shadow-md p-2 align-center justify-center">
            <BirdIcon color="#1A56AE" size={12} />
          </div>
        </Marker>
      }) }
    </>
  )
  
}

const ScientificCollectionModal = ({ popupInfo, setActiveItem }) => {
  return (
    <div className="absolute z-50 bg-white w-[50vw] right-0 h-[99%] right-0 top-0 rounded--l-md shadow-md">
          <div className="flex w-full px-[10%] py-10 max-h-full space-x-2 text-[#54595f] overflow-y-auto overflow-x-hidden ">

            <button className="absolute right-10 top-4 cursor-pointer" onClick={() => setActiveItem(null)}>
              <X />
            </button>

            <div className="general-info flex-1 h-full w-full max-w-[60%]">
              <div className="text-black shadow-md rounded-full mb-8 border-[2px] min-w-20 w-fit px-5 border-black text-lg text-center uppercase">
                <span className="font-semibold">{popupInfo[' Subject ']}</span>
              </div>

              <div className="content h-full">
                <div className="header-section flex flex-col leading-10">
                  <h2 className="color-dark text-[32px] ">
                      <span>{popupInfo['COMMON NAME']}</span>
                  </h2>

                  <h3 className="ct-headline color-dark mb-6 text-[24px] py-3">
                    <span  className="ct-span">
                      <p>
                        <em className="italic">{popupInfo['Scientific name ']}</em></p>
                    </span>
                  </h3>

                  <h3 className="text-xl mb-2 text-[20px] text-[#927f52]">
                    Nomenclature adopted by the&nbsp;<i>Novara </i>&nbsp;scientists
                  </h3>

                  <h3 className="ct-headline text-xl color-dark mb-6 Nomenclature">
                    <span className="ct-span"><em className="italic">Ardea candidissima</em> Gmel.</span>
                  </h3>

                </div>

                <div className="body-section">
                  <div className="description mb-6 text-[16px] text-gray-700">
                    <p>
                      {popupInfo['Description']}
                    </p>
                  </div>

                  <h3 className="text-[24px] text-[#927f52]">References</h3>
                  <div className="py-6 text-[16px] text-gray-700">

                  {popupInfo['References'].split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>))}
                    
                  </div>

                  <h3 className="text-[24px] text-[#927f52]">Links</h3>
                  <div className="py-6 text-[16px] text-gray-700">

                    {
                      popupInfo['Links'].split("\n").map((link,i) => (
                        <a className="my-3" href={link} key={`${link}-${i}`}>
                          <span className="underline">{link}</span>
                        </a>
                      ))
                    }
                   

                  </div>

                </div>
              </div>
            </div>

            <div className="summary-info bg-gray-100 flex-[0.6] px-10 rounded-md h-full">
                <div className="py-12">
                  <h3 className="text-[24px] font-semibold">Details</h3>
                </div>

                <div className="px-3 h-auto w-full">
                  <img src={popupInfo['Featured Images']} className="w-60"/>
                </div>

                <div className="info-section py-5">
                  {
                    ['State of preservation', 'Collection date', 'Collection place', 'Owner', 'Inventory Number', 'Dimension', 'Indice IUCN' ].map((field,i) => {

                      return (
                        <div key={`${field}-${i}`} className="flex text-lg border-t border-black gap-2 items-start leading-6 py-4 text-sm">
                          <h4 className="text-[#927f52] font-semibold w-[100px] flex-0.1 text-md">{field}</h4>
                          <h3 className="capitalize flex-1">{popupInfo[field]}</h3>
                        </div>
                      )
                    })

                  }    
                </div>
            </div>

          </div>
    </div>
  )
}

// popup={
//   new mapboxgl.Popup({ offset:[15,-15], anchor:"left", focusAfterOpen:false }).setHTML(`<divclassName="popup-content">
//     <div className="px-3 h-16 w-12">
//     </div> 
//     <div className="p-2">
//       <h5 className="text-[#1A56AE] text-lg font-semibold">${person['FIRST NAME']} ${person['LAST NAME']}</h5>
//       <div className="popup-content_inner">
//         <div className="flex">
//           <div className="text-gray-400">ID ${person['ID']} - Persons</div>
//         </div>
//         ${
//           fields.map(field => `<div className="flex">
//           <div className="mr-1">${field.label}: </div>
//           <div className="font-semibold">${person[field.field]}</div>
//         </div>`).join("")
//         }
//       </div>
//     </div>
//   </div>`)
// }


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
      1,
      15,
      3
    ],
    'line-opacity': 1
  }
};