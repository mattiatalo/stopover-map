import * as XLSX from 'xlsx';

// let data_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQLR3jQJONvbl5wb5m7iN2lwbyMmC0qtVXTNptqZgkDRgbWDi9NZd661-h1wlqo0Q/pub?output=xlsx";
// let data_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS2gpvmtDGYVIKu5s_reUxVkav-Z4LLoJ85CZ8DI4UWz0uIUtZxLDIZN9hqcJtJQQQwuLDkaW9alo2O/pub?output=xlsx";
let data_url = "/Dati_persone_istituzioni_documenti.xlsx";

export async function getData() {
    let arrayBuffer = await fetch(data_url).then(res => res.arrayBuffer());

    // console.log(arrayBuffer);
    let workbook = XLSX.read(arrayBuffer, {type:'binary'});

    let { SheetNames } = workbook;
    let json_data = {}
    
    SheetNames.forEach(sheet => {
        json_data[sheet] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]).map(entry => {

            if(entry['PLACE COORDINATES DD']) {
                entry['COORDINATES'] = entry['PLACE COORDINATES DD'].split(",").map(entry => parseFloat(entry.trim()));
            }    

            if(entry['COORDINATES, DD']) {
                entry['COORDINATES'] = entry['COORDINATES, DD'].split(",").map(entry => parseFloat(entry.trim()));
            }

            // COORDINATES, DD

            if(entry['COORDINATES DD']) {
                entry['COORDINATES'] = entry['COORDINATES DD'].split(",").map(entry => parseFloat(entry.trim()));
            }

            if(entry['Coordinates']) {
                entry['COORDINATES'] = entry['Coordinates'].split(",").map(entry => parseFloat(entry.trim()));
            }


            return entry;
        });
    });

    // ["institutions", "persons", "scientific_specimen", "documents"]
    // console.log(json_data['Persons']);
    return {
        persons:[...json_data['Persons']].map(entry => ({...entry, stopover:entry['MAIN ENCOUNTER PLACE'], category:'persons'})),
        stopovers:[...json_data['Stopovers']],
        lists:[...json_data['Lists']],
        scientific_specimen:[...json_data['Scientific specimens']].map(entry => ({...entry, stopover:entry['MAIN PLACE'], category:'scientific_specimen'})),
        institutions:[...json_data['Institutions']].map(entry => ({...entry, stopover:entry['MAIN PLACE'], category:'institutions'})),
        documents:[...json_data['Documents']].map(entry => ({...entry, stopover:entry['MAIN COLLECTION PLACE'], category:'documents'})),
        selleny_works:[...json_data['Selleny works']],
    };

    
}

