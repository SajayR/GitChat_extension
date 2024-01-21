import openai
import os
from pymongo import MongoClient
openai.api_key = "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"
client = MongoClient('mongodb://localhost:27017/')
db = client.GitChat
collection = db.ChatStorage



def getanswer(messages: list, session_id: str) -> str:

    if len(messages) >= 7:
        messages = list(messages[0]) + messages[-5:]

    response = openai.chat.completions.create(
    model="gpt-3.5-turbo-1106",
    messages=messages,
    stream=True
    )
    document = collection.find_one({"session_id": session_id})
    
    prompts_length = len(document['frontend'])
    last_element_index = prompts_length 
    last_element_content = f"frontend.{last_element_index}.content"
    last_element_role = f"frontend.{last_element_index}.role"

    reply_content = ""
    if response is not None:
        for chunk in response:
            if chunk.choices[0].delta.content:
                reply_content += chunk.choices[0].delta.content
                # Update the MongoDB document
                collection.update_one(
                    {"session_id": session_id},
                    {"$set": {last_element_content: reply_content, last_element_role: "assistant"}}
                )  
    return reply_content


#MESSEGES OVER HERE NEEDS TO BE FRONTEND MESSAGES
def getfilenamestopull(filemessages, filelist) -> str:
    response = openai.chat.completions.create(
    model="gpt-4-1106-preview",
    response_format={ "type": "json_object" },
    messages=filemessages
    )
    return response.choices[0].message.content 