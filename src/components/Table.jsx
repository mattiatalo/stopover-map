/* eslint-disable react/prop-types */
export default function Table({ data, columnNames, columnMapping, setActiveItem, tableName}) {

    return (
        <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        {columnNames.map(field => (<th key={field.label} scope="col" className="px-2 py-3 text-xs">{field.label}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {
                        data.map((entry,i) => {
                            return <tr key={i} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => setActiveItem({ table:tableName, info:entry})}>
                                { columnNames.map(field => (<td key={field.label} scope="col" className="px-2 py-3 text-xs">
                                        {field.columns.map(col => (<span key={col}>{entry[col]}</span>))}
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
