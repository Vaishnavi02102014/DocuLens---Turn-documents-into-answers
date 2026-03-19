import os
from openai import OpenAI

from app.services.vector_store import get_vector_db

# ✅ ADD THIS CACHE
VECTOR_DB_CACHE = {}


def retrieve_chunks(query, user_id, pdf_name=None):

    # ✅ USE CACHE (important)
    if user_id not in VECTOR_DB_CACHE:
        VECTOR_DB_CACHE[user_id] = get_vector_db(user_id)

    vector_db = VECTOR_DB_CACHE[user_id]

    if not vector_db:
        return []

    if pdf_name:
        results = vector_db.similarity_search(
            query,
            k=3,
            filter={"source": pdf_name}
        )
    else:
        results = vector_db.similarity_search(query, k=3)

    return results


def generate_answer(question, user_id, pdf_name=None):

    docs = retrieve_chunks(question, user_id, pdf_name)

    if not docs:
        return "No relevant information found in the selected PDF(s).", []

    context = "\n\n".join([doc.page_content for doc in docs])

    prompt = f"""
You are a helpful assistant that answers questions based only on the provided context.

Context:
{context}

Question:
{question}

Answer clearly and concisely.
"""

    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=os.getenv("GITHUB_TOKEN")
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You answer questions using provided context."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    answer = response.choices[0].message.content

    # -------- GROUP SOURCES BY PDF --------

    sources_dict = {}

    for doc in docs:
        pdf = doc.metadata.get("source")
        page = doc.metadata.get("page")

        if pdf not in sources_dict:
            sources_dict[pdf] = []

        sources_dict[pdf].append(page)

    sources = []

    for pdf, pages in sources_dict.items():
        sources.append({
            "pdf": pdf,
            "pages": sorted(list(set(pages)))
        })

    return answer, sources


# ✅ ADD THIS FUNCTION (CRITICAL FIX)
def clear_vector_db(user_id):
    if user_id in VECTOR_DB_CACHE:
        del VECTOR_DB_CACHE[user_id]





# import os
# from openai import OpenAI

# from app.services.vector_store import get_vector_db


# def retrieve_chunks(query, user_id, pdf_name=None):

#     vector_db = get_vector_db(user_id)

#     if pdf_name:
#         results = vector_db.similarity_search(
#             query,
#             k=3,
#             filter={"source": pdf_name}
#         )
#     else:
#         results = vector_db.similarity_search(query, k=3)

#     return results


# def generate_answer(question, user_id, pdf_name=None):

#     docs = retrieve_chunks(question, user_id, pdf_name)

#     if not docs:
#         return "No relevant information found in the selected PDF(s).", []

#     context = "\n\n".join([doc.page_content for doc in docs])

#     prompt = f"""
# You are a helpful assistant that answers questions based only on the provided context.

# Context:
# {context}

# Question:
# {question}

# Answer clearly and concisely.
# """

#     client = OpenAI(
#         base_url="https://models.inference.ai.azure.com",
#         api_key=os.getenv("GITHUB_TOKEN")
#     )

#     response = client.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=[
#             {"role": "system", "content": "You answer questions using provided context."},
#             {"role": "user", "content": prompt}
#         ],
#         temperature=0.3
#     )

#     answer = response.choices[0].message.content

#     # -------- GROUP SOURCES BY PDF --------

#     sources_dict = {}

#     for doc in docs:
#         pdf = doc.metadata.get("source")
#         page = doc.metadata.get("page")

#         if pdf not in sources_dict:
#             sources_dict[pdf] = []

#         sources_dict[pdf].append(page)

#     # Convert dictionary → response format
#     sources = []

#     for pdf, pages in sources_dict.items():
#         sources.append({
#             "pdf": pdf,
#             "pages": sorted(list(set(pages)))
#         })

#     return answer, sources


# Converts question into embedding
#                 |
#                 V
# do a similarity search with embeddings stored in vector_db
#                 |
#                 V
# return the 3 most relevant chunks.