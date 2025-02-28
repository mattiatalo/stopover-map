import * as XLSX from 'xlsx';

// let data_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQLR3jQJONvbl5wb5m7iN2lwbyMmC0qtVXTNptqZgkDRgbWDi9NZd661-h1wlqo0Q/pub?output=xlsx";
let data_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS2gpvmtDGYVIKu5s_reUxVkav-Z4LLoJ85CZ8DI4UWz0uIUtZxLDIZN9hqcJtJQQQwuLDkaW9alo2O/pub?output=xlsx ";
// let data_url = "/Dati_persone_istituzioni_documenti.xlsx";

export async function getData(updateDownloadProgress) {
    let arrayBuffer = await fetch(data_url)
    .then(response =>  {
        // console.log(response.headers)
        const contentLength = response.headers.get('Content-Length') || 13.5 * 1024 * 1024;
        if (contentLength === null) {
            throw Error('Response size header unavailable');
        }

        const total = parseInt(contentLength, 10);
        let loaded = 0;

        return new Response(
            new ReadableStream({
                start(controller) {
                    const reader = response.body.getReader();

                    read();
                    async function read() {
                        const {done, value} = await reader.read();

                        if (done) {
                            controller.close();
                            return; 
                        }

                        loaded += value.length;
                        updateDownloadProgress({loaded, total})

                        controller.enqueue(value);
                        read();
                    }
                }
            })
        );


    })
    .then(res => res.arrayBuffer());

    // console.log(arrayBuffer);
    let workbook = XLSX.read(arrayBuffer, {type:'binary'});

    let { SheetNames } = workbook;
    // console.log(workbook);
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

            // -22.9579824,-43.2237206

            return entry;
        });
    });

    // ["institutions", "persons", "scientific_specimen", "documents"]
    // console.log(json_data['Stopovers']);
    // console.log(json_data['Scientific specimens'].filter(place => place['SPLINE-CODE']));
    return {
        persons:[...json_data['Persons']].map(entry => ({...entry, stopover:entry['MAIN ENCOUNTER PLACE'], category:'persons'})),
        stopovers:[...json_data['Stopovers'].filter(entry => entry['COORDINATES'][0] < 90 && entry['COORDINATES'][0] > -90).map((stopover, i) => ({...stopover, id:i}))],
        lists:[...json_data['Lists']],
        scientific_specimen:[...json_data['Scientific specimens']].map(entry => ({...entry, stopover:entry['MAIN PLACE'], category:'scientific_specimen'})),
        institutions:[...json_data['Institutions']].map(entry => ({...entry, stopover:entry['MAIN PLACE'], category:'institutions'})),
        documents:[...json_data['Documents']].map(entry => ({...entry, stopover:entry['MAIN COLLECTION PLACE'], category:'documents'})),
        selleny_works:[...json_data['Selleny works']],
    };

    
}

export const loadPageIntroSections = async () => {
    let urls = [fetch("https://globalsearoutes.net/wp-json/wp/v2/pages/2546"), fetch("https://globalsearoutes.net/wp-json/wp/v2/pages/2541")];

    let responses = await Promise.all(urls).then(responses => Promise.all(responses.map(res => res.json())) )
    console.log(responses);
    let languages = ["en", "it"];
    let content = responses.reduce((a,b, i) => {
        a[languages[i]] = b.content.rendered;

        return a;
    }, {});

    return {...content};
}