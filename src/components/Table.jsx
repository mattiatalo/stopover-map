import { useLocalization, useTranslation } from "./LocalizationProvider";

/* eslint-disable react/prop-types */
export default function Table({ data, columnNames, columnMapping, setActiveItem, setHoverItem, tableName}) {
    const t = useTranslation();
    const { language } = useLocalization();
    
    const handleMouseOver = (category, entry) => {
        setHoverItem(entry);
    }

    const handleMouseLeave = () => {
        // console.log("Mouse Leave");
        setHoverItem("");
    }

    return (
        <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 da:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 da:bg-gray-700 da:text-gray-400">
                    <tr>
                        {columnNames.map(field => (<th key={field.label} scope="col" className="px-2 py-3 text-xs">{t(field.label.toLocaleLowerCase().split(" ").join("_"))}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {
                        (tableName == "persons" ? data.sort((a,b) => (a['LAST NAME'] || "").localeCompare( b['LAST NAME'])) : data).map((entry,i) => {
                            return <tr key={i} 
                                className="bg-white border-b da:bg-gray-800 da:border-gray-700 cursor-pointer hover:bg-gray-100" 
                                onClick={() => setActiveItem({ table:tableName, info:entry})}
                                onMouseOver={() => handleMouseOver(tableName, entry)}
                                onMouseLeave={() => handleMouseLeave()}
                            >
                                { columnNames.map(field => (<td key={field.label} scope="col" className="px-2 py-3 text-xs">
                                        {field.columns.map(col => (entry[col] !== "N. A." ? 
                                            <span key={col} className="mr-1">{language  !== "it" ? entry[col] : (entry['ITA_'+col] ||entry[col])}</span> 
                                        : ""))}
                                    </td>)) 
                                }
                            </tr>
                        })
                    }
                </tbody>
            </table>
        </div>

    )
}
