import os
from openai import OpenAI

def generate_pdf_summary(text):

    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=os.getenv("GITHUB_TOKEN")
    )

    prompt = f"""
    You are an expert computer science tutor helping students prepare for exams.

    Convert the following study material into well-structured study notes.

    STRICT FORMAT RULES:

    1. Each section must start with a short topic name.
    2. Topic names must be 1–4 words only.
    3. Topic names must NOT contain bullet symbols.
    4. Topic names must NOT be full sentences.
    5. Under each topic write bullet explanations.
    6. Every bullet must start with the symbol "•".
    7. Bullet points should clearly explain the concept.
    8. Include definitions, key properties, and important ideas.
    9. Avoid unnecessary repetition.
    10. Do NOT mention diagrams or figures.

    Example format:

    CPU Scheduling
    • Assigns CPU time to processes.
    • Improves CPU utilization.
    • Enables multiprogramming.

    Dispatcher
    • Module that transfers CPU control to the selected process.
    • Performs context switching.

    Scheduling Criteria
    • CPU utilization measures how busy the CPU is.
    • Throughput counts the number of completed processes.

    Now summarize the following study material clearly for exam preparation:

    {text}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return response.choices[0].message.content