console.log("in trainCSV.js")

const codingSystems = {}


// load the model...
let use_model = ""

window.addEventListener("load", () => {
    document.body.style.cursor = 'wait'
    statusElement = document.getElementById("status")
    setStatus("loading model ...")
})
use.load().then(m => {
    console.log("model loaded ...")
    use_model = m
    document.body.style.cursor = 'auto'
    setStatus("model loaded ...")

    use_model.embed("doctor").then(t => t.print())
})

let statusElement = ""
function setStatus(txt) {
    statusElement.innerText = txt
}

console.log("fetching soc2010 coding system...")
fetch("https://danielruss.github.io/codingsystems/soc_2010_6digit.json")
    .then(response => response.json())
    .then(soc2010 => {
        soc2010.codes = soc2010.map(description => description.code)
        soc2010.index = {}
        soc2010.forEach((desc, index) => soc2010.index[desc.code] = index)
        codingSystems.soc2010 = soc2010;
        console.log(soc2010)
    })


function soc_mlb(socs, buffer) {
    socs.forEach(soc => buffer.set(1, codingSystems.soc2010.index[soc]))
    return buffer.toTensor()
}

async function modeling(csv_data) {
    console.log("in modeling...")

    csv_data.forEach()
    dta = map()
    dta = await Promise.all(dta)

    // create a dataset from an array of objects...
    let ds = tf.data.array(csv_data).take(100);
    setStatus(`processing data`)

    ds = ds.map(x => ({
        "x": x.JobTitle,
        "y": [x.SOC2010_1, x.SOC2010_2, x.SOC2010_3].filter(word => codingSystems.soc2010.codes.includes(word))
    }))


    console.log("1....");
    // remove rows with no labels..
    ds = ds.filter(row => row.y.length > 0);
    //await ds.forEachAsync(x => console.log(`xs: ${x.x}\nys: ${x.y}\n   `))
    //  multilabel encode the results
    //  embed the text...
    ds = ds.map(async (row) => {
        setStatus('encoding the data')
        console.log('encoding the data')
        let buffer = tf.buffer([codingSystems.soc2010.length])
        console.log(Date.now(), ": ", row.x)
        row.y = soc_mlb(row.y, buffer)
        // move to next await
        row.x = await use_model.embed(row.x)
        return row
    })
    console.log("2....")
    //    console.log("3....")
    //    await ds.map(x => console.log(`xs: ${x.x}\nys: ${x.y.argMax()}\n   `, x.y.toString()))
    //    console.log("4....")
    //await ds.forEachAsync(x => console.log(`xs: ${x.x}\nys: ${x.y}\n   `))
    //    console.log("5....")
    setStatus(`building the model`)

    //    let trained_model = build_model(ds)

    setStatus(" ... Complete...")
    window.ds = ds
}

async function build_model(ds) {
    await ds.take(3).forEachAsync(x => console.log(`xs: ${x.x} length: ${x.x.shape[1]}\nys: ${x.y}\n   `))
    console.log(ds)
    //    const soc_model = tf.sequential()
    //    soc_model.add(tf.layer.dense({units:}))
    return null
}
function loadData(file) {
    console.log(`in loadData: ${file.name}`)
    setStatus(`reading file ${file.name}`)

    let row_number = 0
    Papa.parse(file, {
        header: true,
        beforeFirstChunk1: function (file, inputElement) {
            console.log("... BEFORE ... ")
            console.log(file)
            console.log(inputElement)
        },
        step1: function (results, parser) {
            if (row_number == 0) {
                console.log(`... check that the data has an "Id" and "JobTitle"....`)
                const a = new Set(['Id', 'JobTitle'])
                results.meta.fields.forEach(col => a.delete(col))
                if (a.size > 0) {
                    console.log(`missing column(s): ${Array.from(a).join(', ')}`)
                    parser.abort()
                    return
                };

            }
            row_number++;
        },
        complete: function (results, file) {
            setStatus(`finished reading file ${file.name}`)
            modeling(results.data)
        }

    })
}

