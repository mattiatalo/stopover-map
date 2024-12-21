/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// Mandatory CSS required by the Data Grid
import 'ag-grid-community/styles/ag-grid.css';
// Optional Theme applied to the Data Grid
import 'ag-grid-community/styles/ag-theme-quartz.css';
// React Data Grid Component
import { AgGridReact } from 'ag-grid-react';


const pagination = true;
const paginationPageSize = 500;
const paginationPageSizeSelector = [200, 500, 1000];


const ImageRenderer = (params) => {
    // console.log(params);

    return (<span className="imgSpanLogo">
        {params.value && (
            <img
                alt={`${params.value} Flag`}
                src={params.value}
                className="logo"
            />
        )}
    </span>)
};
const Grid = ({ data, columnNames, columnMapping, tableName, setActiveItem}) =>  {

    if(!data.length) {
        return;
    }
    
    const colDefs = Object.keys(data[0]).filter(key => key && key !== "__EMPTY").reduce((a,b) => {
        a.push({ 
            field:b, 
            filter: b == "FEATURED IMAGE" ? false : true, 
            floatingFilter: true,
            cellRenderer: b == "FEATURED IMAGE" ? ImageRenderer : ""
        });

        return a;
    }, []);

    const handleRowClick = (event) => {
        // console.log(event);
        setActiveItem({ info:event.data, table:tableName});
    }

    const rowData = data.map(dt => {
        return dt;
    });
    
    return (
        // wrapping container with theme & size
        <div
            className="ag-theme-quartz" // applying the Data Grid theme
            style={{ height: "100%" }} // the Data Grid will fill the size of the parent container
        >
            <AgGridReact 
                rowData={rowData} 
                columnDefs={colDefs} 
                pagination={pagination}
                paginationPageSize={paginationPageSize}
                paginationPageSizeSelector={paginationPageSizeSelector}
                onRowClicked={handleRowClick}
            />

        </div>
    );
}


export default Grid;