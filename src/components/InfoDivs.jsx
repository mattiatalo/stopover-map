/* eslint-disable react/prop-types */
import ImageViewer from './ImageViewer';
import { useLocalization, useTranslation } from './LocalizationProvider'
import { VoyageColors } from './constants';

let colors = {
    "stopovers":"red",
    "persons":"orange",
    "documents":"cyan",
    "institutions":"grey",
    "scientific_specimen":"green"
};

let fields = {
    stopovers:['ARRIVAL DAY', 'DEPARTURE DAY',  'DURATION (days)'],
    institutions:["Foundation date", 'Director',  "Nature"  ],
    documents:[
        "YEAR  / DATE","PUBLISHER / PRINTER","MAIN COLLECTION PLACE",  "COLLECTING MODE", "CURRENT OWNER",
        "COLLECTION",  

        // "SECONDARY COLLECTION PLACE", "ALTERNATIVE TITLE / NAME", "ENGLISH TRANSLATION", "FIRST AUTHOR", "SECOND AUTHOR",
        // "TRANSLATED BY", "EDITED BY", "KIND OF SOURCE", "MEDIUM", "MEASURES / QUANTITY / FORMAT", "LANGUAGE",  
        // "PERIOD", "MAIN LOCAL INSTITUTION INVOLVED", "MAIN LOCAL PERSON INVOLVED",  "COLLECTION"
    ],
    persons:["LIFE DATES", "COUNTRY OF BIRTH",  "TITLE", "OCCUPATION",  "INSTITUTION NAME", 
        "MAIN ENCOUNTER PLACE",  "ENCOUNTER DATE", "GENDER"
    ]
};

// stopover
export const StopOverDiv = ({ popupInfo, setActiveItem, setActiveLink, category, onLinkClick }) => {
    const { language } = useLocalization();
    const t = useTranslation();
    
    return (
        <div 
            className={`detail-modal bg-[#f1f0ee] `}
        >
            <div className={`flex w-full px-[2%] py-5 max-h-full text-[#54595f] overflow-y-auto overflow-x-hidden`}>
                <div className="general-info flex-1 h-full w-full max-w-full text-[#363636]">
                    {popupInfo['MAIN PLACE'] && <div className="border-b border-gray-300 w-full text-left text-xl mb-3">
                        { popupInfo['MAIN PLACE']} ({popupInfo['STOPOVER']})
                    </div> } 
                    
                    <div className="">
                        {popupInfo['IMAGES'] && <ImageViewer imageUrl={popupInfo['IMAGES']} alt="" className='h-auto' showImage={true} onClose={console.log}/>}
                        <figcaption className='my-3 text-sm'>
                            {language == "it" ? popupInfo['ITA_CAPTION'] : popupInfo['CAPTION']}
                        </figcaption>
                    </div>

                    {/* { popupInfo.category  && <div className="shadow-md rounded-full mb-4 mt-2 border-[1px] px-5 w-fit min-w-20 border-black text- text-center uppercase" style={{ borderColor: colors[popupInfo.category]}}>
                        <span className="font-semibold" >{popupInfo.category}</span>
                    </div> } */}

                    <div className="body-section">
                        <div className="summary-info bg-[#D4D4D4] flex-[0.6] p-[20px] rounded-[10px] h-full my-[13px]">
                            <div className="info-section grid grid-cols-1 gap-2">
                                {
                                    fields[category || 'stopovers'].map((field,i) => {
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

                        
                            <div  style={{ backgroundColor:(VoyageColors[popupInfo['VOYAGE VARIANTS']] || "gray")}} className='p-2 rounded-md my-2 text-title'>
                                {language == "it" ? popupInfo['ITA_VOYAGE VARIANTS'] : popupInfo['VOYAGE VARIANTS']}
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
        
                        </div> </> : "" }
                    </div>
                </div>
            </div>
        </div>
    )
}

// persons
export const PersonsDiv = ({ popupInfo, setActiveItem, setActiveLink, category, onLinkClick}) => {
    const { language } = useLocalization();
    const t = useTranslation();
    
    // let description = (popupInfo['FROM THE SCIENTIFIC VOLUMES'] || popupInfo['ROLE DESCRIPTION'] || popupInfo['DESCRIPTION'] || "");
    const description = language == "it" ? 
        (popupInfo['ITA_FROM THE SCIENTIFIC VOLUMES'] || popupInfo['ITA_ROLE DESCRIPTION'] || popupInfo['ITA_DESCRIPTION'] || "") :
        (popupInfo['FROM THE SCIENTIFIC VOLUMES'] || popupInfo['ROLE DESCRIPTION'] || popupInfo['DESCRIPTION'] || "");


    let personsName = "";
    personsName += popupInfo['LAST NAME'] == "N. A." ? "" : popupInfo['LAST NAME'];
    personsName += popupInfo['FIRST NAME'] == "N. A." ? "" : " " + popupInfo['FIRST NAME'];

    return (
        <div className="general-info flex-1 h-full w-full max-w-full text-[#363636]">
               
                     
  
                <div className="content h-full">
                  <div className="header-section flex flex-col">

                    <div className="px-0 h-auto w-full">
                        {popupInfo['IMAGE'] && <ImageViewer imageUrl={popupInfo['IMAGE']} alt="" className='h-auto' showImage={true} onClose={console.log}/>}
                    </div>

                    <h2 className="text-[#363636] text-[1.5em] mt-5">
                        <strong>{ personsName}</strong>  
                    </h2>

                    
                    <hr className='mt-3 border-black'/>  
                  </div>
                    

                  <div className="body-section">
                    

                    
                    <div className="summary-info bg-[#D4D4D4] flex-[0.6] p-[20px] rounded-[10px] h-full my-[13px]">
        
                        <div className="info-section grid grid-cols-1 gap-2">
                            {
                                fields[category || 'stopovers'].map((field,i) => {
                                    return (
                                        (popupInfo[field] && popupInfo[field] !== "N. A.") ? <div key={`${field}-${i}`} className="flex flex-col text-lg border-b border-[#ad9a6d] gap-2 items-start pt-0 text-sm w-full">
                                            <h4 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[17px] w-full capitalize">{t(field.toLocaleLowerCase()) || field}</h4>
                                            <h5 className="capitalize text-[1.1em] mb-3">{language == "it" ? (popupInfo[`ITA_${field}`] || popupInfo[field]) : popupInfo[field] || "N.A"}</h5>
                                        </div> : ""
                                    )
                            })
        
                            }   
                        </div>
                    </div>

                    { (popupInfo['QUOTATION'] && popupInfo['QUOTATION'] !== "N. A.") ? <div className="description my-[25px] text-[14px] text-gray-700">
                        <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full capitalize">{t('quotation')}</h3>
                      <div>
                        {( popupInfo[ language == "it" ? 'ITA_QUOTATION': 'QUOTATION'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>))}
                      </div>

                      <hr className='my-3 border-black'/>
                    </div> : "" }

                  
                        
                    {(popupInfo["RESOURCES LINKS"] || popupInfo['RESOURCES LINK'] || "") ? 
                    <>
                    <h3 className="text-title text-[18px] text-[#ad9a6d] font-semibold capitalize">{t('resources')}</h3>
                    <div className="pb-5 text-[14px] text-gray-700">
  
                      {
                        (popupInfo['LINKS'] || popupInfo["RESOURCES LINKS"] || popupInfo['RESOURCES LINK'] || "").split("\n").map((link,i) => (
                          <a className="my-3" href={link} key={`${link}-${i}`} onClick={onLinkClick}>
                            <span className="underline pointer-events-none">{popupInfo['RESOURCES']}</span>
                          </a>
                        ))
                      }
  
                    </div> 
                    </> : ""}
  
                  </div>
                </div>
        </div>
    )
}

// documents
export const DocumentsDiv = ({ popupInfo, setActiveItem, setActiveLink, category, onLinkClick}) => {
    const { language } = useLocalization();
    const t = useTranslation();
    
    return (
        <div className="general-info flex-1 h-full w-full max-w-full text-[#363636]">
            {/* <div className="shadow-md rounded-full mb-4 mt-2 border-[1px] px-5 w-fit min-w-20 border-black text- text-center uppercase" style={{ borderColor: colors[popupInfo.category]}}>
                <span className="font-semibold" >{popupInfo.category}</span>
            </div> */}

                             
  
                <div className="content h-full">
                    <div className="header-section flex flex-col">

                        <h2 className="text-[#363636] text-[1.5em]">
                            <strong>{popupInfo['FIRST AUTHOR']}</strong>                       
                        </h2>

                        <h2 className="text-[#393939] text-[1.25em] my-2">
                            <strong>{popupInfo[ language == 'it' ? 'ITA_TITLE / NAME' : 'TITLE / NAME']}</strong>                       
                        </h2>


                        <div className="px-0 h-auto w-full">
                            {popupInfo['IMAGE'] && <ImageViewer imageUrl={popupInfo['IMAGE']} alt="" className='h-auto' showImage={true} onClose={console.log}/>}
                        </div>
                        <hr className='mt-3 border-black'/>  
                    </div>
                    

                  <div className="body-section">
                    
                    <div className="summary-info bg-[#D4D4D4] flex-[0.6] p-[20px] rounded-[10px] h-full my-[13px]">
        
                        <div className="info-section grid grid-cols-1 gap-2">
                            {
                                fields[category || 'stopovers'].map((field,i) => {
                                    return (
                                        (popupInfo[field] && popupInfo[field] !== "N. A.") ? <div key={`${field}-${i}`} className="flex flex-col text-lg border-b border-[#ad9a6d] gap-2 items-start pt-0 text-sm w-full">
                                            <h4 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[17px] w-full capitalize">{t(field.toLocaleLowerCase()) || field}</h4>
                                            <h5 className="capitalize text-[1.1em] mb-3">{popupInfo[field] || "N.A"}</h5>
                                        </div> : ""
                                    )
                            })
        
                            }   

                            {popupInfo['DIGITAL VERSION'] && <div className="flex flex-col text-lg border-b border-[#ad9a6d] gap-2 items-start pt-0 text-sm w-full">
                                <h4 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[17px] w-full capitalize">{t('DIGITAL VERSION'.toLocaleLowerCase()) ||'DIGITAL VERSION'}</h4>
                                <h5 className="capitalize text-[1.1em] mb-3">
                                    { popupInfo['DIGITAL VERSION'] !== "N.A" ? 
                                        <a href={popupInfo['DIGITAL VERSION']} className='underline pointer-events-none' onClick={onLinkClick}>
                                            Link 
                                        </a> : "N.A"}
                                    </h5>
                            </div> }


                        </div>
                    </div>

                    { (popupInfo['QUOTATION'] && popupInfo['QUOTATION'] !== "N. A.") ? <div className="description my-[25px] text-[14px] text-gray-700">
                        <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full capitalize">{t('quotation')}</h3>
                      <div>
                        {(popupInfo[language == "it" ? "ITA_QUOTATION" : 'QUOTATION'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>))}
                      </div>

                      <hr className='my-3 border-black'/>
                    </div> : "" }

                    {(popupInfo["RESOURCES LINKS"] || popupInfo['RESOURCES LINK'] || "") ? 
                    <>
                    <h3 className="text-title text-[18px] text-[#ad9a6d] font-semibold capitalize">{t('resources')}</h3>
                    <div className="pb-5 text-[14px] text-gray-700">
  
                      {
                        (popupInfo['LINKS'] || popupInfo["RESOURCES LINKS"] || popupInfo['RESOURCES LINK'] || "").split("\n").map((link,i) => (
                          <a className="my-3" href={link} key={`${link}-${i}`} onClick={onLinkClick}>
                            <span className="underline pointer-events-none">{popupInfo['RESOURCES']}</span>
                          </a>
                        ))
                      }
  
                    </div> 
                    </> : ""}
                    
  
                    {/* {(popupInfo['REFERENCES'] || "") ?
                    <>
                    <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full">{t('references')}</h3>
                    <div className="mt-[2px] mb-[25px] text-[14px] text-gray-700">
                        {(popupInfo['REFERENCES'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>))}
                    </div>

                    <hr className='my-3 border-black'/> </>
                    : ""} */}
                        
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
    )
}

// institutions
export const InstitutionDiv = ({ popupInfo, setActiveItem, setActiveLink, category, onLinkClick}) => {
    const { language } = useLocalization();
    const t = useTranslation();
    
    return (
        <div className="general-info flex-1 h-full w-full max-w-full text-[#363636]">
               
        {/* { popupInfo.category  && <div className="shadow-md rounded-full mb-4 mt-2 border-[1px] px-5 w-fit min-w-20 border-black text- text-center uppercase" style={{ borderColor: colors[popupInfo.category]}}>
            <span className="font-semibold" >{popupInfo.category}</span>
        </div> }                */}

        <div className="content h-full">
          <div className="header-section flex flex-col">
            <h2 className="text-[#363636] text-[1.5em]">
                <strong>{popupInfo['INSTITUTION NAME']}</strong>                       
            </h2>

            {popupInfo['ITA_MAIN PLACE'] && <div>
                { language == "it" ? popupInfo['ITA_MAIN PLACE'] : popupInfo['MAIN PLACE']} ({ language == "it" ? popupInfo['ITA_MAIN PLACE'] : popupInfo['MAIN PLACE']})
            </div> }
            <hr className='mt-3 border-black'/>  
          </div>
            

          <div className="body-section">            
            <div className="summary-info bg-[#D4D4D4] flex-[0.6] p-[20px] rounded-[10px] h-full my-[13px]">

                <div className="info-section grid grid-cols-1 gap-2">
                    {
                        fields[category || 'stopovers'].map((field,i) => {
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

            { popupInfo['Quotation']  ? <div className="description my-[25px] text-[14px] text-gray-700">
                <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full capitalize">{t('quotation')}</h3>
              <div>
                {( language == "it" ? popupInfo['Citazione'] : popupInfo['Quotation'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">{ref}</p>))}
              </div>

              <hr className='my-3 border-black'/>
            </div> : "" }

            {(popupInfo['References'] || "") ?
            <>
            <h3 className="text-title text-[#ad9a6d] font-semibold w-[100px] text-[18px] w-full capitalize">{t('references')}</h3>
            <div className="mt-[2px] mb-[25px] text-[14px] text-gray-700">
                {(popupInfo['References'] || "").split("\n").map((ref,i) => (<p key={`${ref}-${i}`} className="mb-2">
                    <a className="my-3" href={ref} key={`${ref}-${i}`} onClick={onLinkClick}> {ref}</a>
                </p>))}
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
    )
}
