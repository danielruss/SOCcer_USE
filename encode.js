console.log("... in encode.js")



export async function encode(model, txt, output_element) {
    console.log(`encoding ${txt}`)

    output_element.innerHTML = `Encoding ${txt}<hr>`
    const tokens = await model.tokenizer.encode(txt)

    model.embed(txt).then((embeddings) =>
        output_element.innerHTML = `Encoding ${txt}<hr>Tokens: ${tokens}<br>${tokens.map(i => model.tokenizer.vocabulary[i][0]).join(", ")}<br>embedings: ${embeddings}`
    );

}