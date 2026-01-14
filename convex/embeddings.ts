export async function embedText(text : string) : Promise<number[]>{
    const response = await fetch("http://localhost:11434/api/embeddings",{
        method : "POST",
        headers : {
            "Content-type" : "application/json",
        },
        body : JSON.stringify({
            model : "nomic-embed-text",
            prompt : text
        })
    })

    const result = await response.json()
    return result.embedding
}