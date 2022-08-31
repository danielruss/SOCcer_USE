console.log("... in encode.js")

export async function encode(model, txt, output_element) {
    console.log(`encoding ${txt}`)

    output_element.innerHTML = `Encoding ${txt}<hr>`
    const tokens = await model.tokenizer.encode(txt)

    model.embed(txt).then((embeddings) => {
        output_element.innerHTML = `Encoding ${txt}<hr>`
        addJob(output_element, model, txt, tokens, embeddings)
    });
}

function addJob(output_element, model, txt, tokens, embeddings) {
    output_element.insertAdjacentHTML('beforeend',
        `<div class="result">
        <div class="title">${txt}</div>
        <div>${tokens.map(i => model.tokenizer.vocabulary[i][0]).join(", ")}</div>
        <div>${embeddings}</div>
    </div>`)
}


export async function encodeFile(model, file_element, output_element) {
    const selectedFile = file_element.files[0];
    output_element.innerHTML = `encoding ${selectedFile.name}<hr>`
    Papa.parse(selectedFile, {
        header: true,
        before: function (file, inputElem) {
            console.log(`starting ${file.name} at ${new Date()} `)
        },
        complete: async function (results, file) {
            console.log(`finished ${file.name} at ${new Date()} `)
            console.log(results)


            for (let indx = 1; indx <= 10; indx++) {
                let txt = results.data[indx].JobTitle
                let tokens = await model.tokenizer.encode(txt)
                let embeddings = await model.embed(txt)
                addJob(output_element, model, txt, tokens, embeddings)
            }
        }
    });
}