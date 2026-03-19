from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_text(pages, filename, user_id):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    chunks = []

    for page in pages:

        splits = splitter.split_text(page["text"])

        for chunk in splits:

            chunks.append({
                "text": chunk,
                "metadata": {
                    "source": filename,
                    "page": page["page"],
                    "user_id": user_id
                }
            })

    return chunks