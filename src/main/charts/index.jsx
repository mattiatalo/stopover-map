/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react'
import { Bar, Pie } from 'react-chartjs-2';
import {
    ArcElement,
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useLocalization, useTranslation } from '../../components/LocalizationProvider';
  
  ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
  );

export default function Charts({ tableData, tableName}) {
    // console.log(tableName);
  return (
    <div className='p-4'>
        { tableName == 'scientific_specimen' && <SpecimenCharts tableData={tableData} tableName={tableName} /> }
        { tableName == "documents" && <DocumentCharts tableData={tableData} tableName={tableName} /> }
        { tableName == "persons" && <PersonsCharts tableData={tableData} tableName={tableName} /> }
        { tableName == "institutions" && <InstitutionCharts tableData={tableData} tableName={tableName} /> }
    </div>
  )
}

const colors = [
    '#66C5CC', '#F6CF71', '#F89C74', '#DCB0F2', '#87C55F', '#9EB9F3', '#FE88B1', 
    '#E58606', '#5D69B1', '#52BCA3', '#99C945', '#CC61B0', '#24796C', '#DAA51B', '#2F8AC4', '#764E9F', '#ED645A', '#CC3A8E', '#A5AA99'
];

const SpecimenCharts = ({ tableData, tableName}) => {
    return (
        <div className="charts">  
        <div className="grid grid-cols-2">
            <div className="w-full">
                <h5 className='my-3'>SPECIMENS BY COLLECTION PLACE</h5>
                <PieChartSpecimen tableData={tableData} columnName={"MAIN PLACE"} title="Collection Place"/>
            </div>

            <div className="w-full">
                <h5 className='my-3'>SPECIMENS ACCORDING TO THE VOYAGE NARRATIVE</h5>
                <PieChartSpecimen tableData={tableData} columnName={"CLASS"} title="Voyage Narrative"/>
            </div>
        </div>          
            
            
            
        </div>
    )
        
}

const InstitutionCharts = ({ tableData, tableName}) => {
    const t = useTranslation();

    return (
        <div className="charts">  
            <div className="grid grid-cols-1">
                <div className="w-full">
                    <h5 className='my-3 capitalize'>Institution by Place</h5>
                    <PieChartSpecimen tableData={tableData} columnName={"MAIN PLACE"} title={t("place")} type="bar" percentage={false} />
                </div>
            </div>  

            <div className="grid grid-cols-1">
                <div className="w-full">
                    <h5 className='my-3'>Institutions By Typology</h5>
                    <PieChartSpecimen tableData={tableData} columnName={"Typology"} title={t("typology")} type="bar" percentage={false} />
                </div>
            </div>                   
        </div>
    )
        
}

const DocumentCharts = ({ tableData, tableName}) => {
        return (
            <div className="charts">  
                <div className="grid grid-cols-1">
                    <div className="w-full">
                        <h5 className='my-3'>Documents BY COLLECTION PLACE</h5>
                        <PieChartSpecimen tableData={tableData} columnName={"MAIN COLLECTION PLACE"} title="Collection Place" type="bar" percentage={false} />
                    </div>
                </div>                   
            </div>
        )
            
}

const PersonsCharts = ({ tableData, tableName}) => {
    return (
        <div className="charts">  
            <div className="grid grid-cols-1">
                <div className="w-full">
                    <h5 className='my-3'>ENCOUNTER BY GENDER</h5>
                    <PieChartSpecimen tableData={tableData} columnName={"GENDER"} title="Gender" type="pie" percentage={true} />
                </div>

                <div className="w-full">
                    <h5 className='my-3'>ENCOUNTERED PEOPLE BY PLACES OF ENCOUNTER</h5>
                    <PieChartSpecimen tableData={tableData} columnName={"MAIN ENCOUNTER PLACE"} title="MAIN ENCOUNTER PLACE" type="bar" percentage={false} label={false} />
                </div>

                <div className="w-full">
                    <h5 className='my-3'>ENCOUNTERED PEOPLE BY PLACES OF BIRTH</h5>
                    <PieChartSpecimen tableData={tableData} columnName={"COUNTRY OF BIRTH"} title="COUNTRY OF BIRTH" type="bar" percentage={false} label={false} />
                </div>

                {/* typology */}
                <div className="flex flex-col">
                    <div className="w-full">
                        <h5 className='my-3'>ENCOUNTERED PEOPLE BY OCCUPATION TYPOLOGY</h5>
                        <PieChartSpecimen tableData={tableData} columnName={"OCCUPATION TYPOLOGY"} title="OCCUPATION TYPOLOGY" type="pie" percentage={true} label={true} />
                    </div>

                    <div className="w-full">
                        <h5 className='my-3'>ENCOUNTERED PEOPLE BY OCCUPATION TYPOLOGY</h5>
                        <PieChartSpecimen tableData={tableData} columnName={"OCCUPATION TYPOLOGY"} title="OCCUPATION TYPOLOGY" type="bar" percentage={false} label={false} />
                    </div>
                </div>
                

                
            </div>                   
        </div>
    )
        
}


const PieChartSpecimen = ({tableData, columnName, title, type="pie", percentage=true }) => {
    // console.log(percentage);
    const { language } = useLocalization();
    let { values, labels} = groupDataBy(tableData, columnName, percentage, language);

    const options = {
        indexAxis: 'x',
        elements: {
          bar: {
            borderWidth: 2,
          },
        },
        responsive: true,
        plugins: {
            datalabels: {
                display:type !== "bar",
                color: 'white',
                backgroundColor:colors.slice(0, labels.length-1),
                borderColor:'#ddd',
                borderWidth:1,
                borderRadius:5,
                anchor: type == "pie" ? 'end' : "center",
                offset:[10,15],
            },
            legend: {
                display:false,
                position: 'left',
            },
            title: {
                display: true,
                text: title,
            },
        },
    };

    const data = {
        labels,
        datasets: [
          {
            label: percentage ? "Percentage" : "Count",
            data: values,
            borderColor: "#fff",
            borderWidth:1,
            backgroundColor: colors.slice(0, labels.length-1),
            datalabels:{
                color: function(ctx) {
                    var value = ctx.dataset.data[ctx.dataIndex];
                    return 'white';
                },
                formatter: function(value, ctx) {
                    return !percentage ? values[ctx.dataIndex] : `${Math.round(value * 1000) / 1000}%`;
                },
                value:{
                    formatter: function(value, ctx) {
                        return `${Math.round(value * 1000) / 1000}%`;
                    },
                }
            }
          }
        ]
    };

    return (
        <div className='flex w-full justify-start'>
            <div className={`full max-h-[400px] p-2 min-h-[300px] bg-gray-50 ${type == 'pie' ? 'max-w-[400px] w-full' : 'w-[100%]' }`}>
                {type == "pie" && <Pie data={data} options={options} />}
                { type == "bar" && <Bar data={data} options={options} />}
            </div>

            <div className="mx-4 max-h-[350px] overflow-hidden bg-gray-50/20 overflow-y-auto">
                <table className='w-full text-sm text-left rtl:text-right text-gray-500 '>
                    <thead>
                        <tr className='"bg-white border-b cursor-pointer hover:bg-gray-100'>
                            <th className='px-1 py-1 text-xs capitalize'>{columnName.toLocaleLowerCase()}</th>
                            <th className='px-1 py-1 text-xs'>Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {values.map((value,i) => {
                            return <tr key={i} className='"bg-white border-b cursor-pointer hover:bg-gray-100'>
                                <td className='px-1 py-1 text-xs'>{labels[i]}</td>
                                <td className='px-1 py-1 text-xs'>{ percentage ? Math.floor(value/100 * tableData.length) : value} </td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )

}

const groupDataBy = (data, column, percentage=true, language) => {
    // console.log(percentage);
    let colName = language == "it" ? `ITA_${column}` : column;

    let groups = [...new Set(data.map(entry => entry[colName]))].filter(value => value);
    if(!groups.length) {
        colName = column;
        groups = [...new Set(data.map(entry => entry[column]))].filter(value => value);
    }

    let values = groups.map(entry => {
        let count = data.filter(item => item[colName] == entry).length;

        return percentage ? parseFloat((count * 100/data.length).toFixed(1)) : count; 
    });

    // console.log(values);

    return {labels:groups, values};
}