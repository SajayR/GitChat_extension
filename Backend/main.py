import os
import requests
from flask import Flask, request, jsonify, make_response
from GitScripts import gitmain, extracting
from flask_cors import CORS
import OpenAI.daddy as chatmain
script_dir = os.path.dirname(os.path.realpath(__file__))
import threading
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
try:
    client.admin.command('ismaster')
    print("MongoDB is connected!")
except Exception as e:
    print("Unable to connect to the server.", e)
db = client.GitChat
collection = db.ChatStorage




app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "chrome-extension://<extension-id>"}})  #PLS EDIT EXTENSION ID IF GOTTEN

@app.route('/gitget', methods=['POST'])
def getgitfiles():
    session_id = request.cookies.get('sessionId')  # Retrieve sessionId from cookie
    data = request.get_json()
    repo_path = os.path.join(script_dir, 'GitScripts/ClonedUserRepo', session_id)
    print("Repo Path: ", repo_path)
    if os.path.exists(repo_path):
        print("Repo already exists")
        os.system(f'rm -rf {repo_path}')
    else:
        print("Repo does not exist")
    data['session_id'] = session_id  # Make sure to include sessionId in the data

    def thread_target():
        with app.app_context():
            gitmain.getGit(data)
            file_directory = get_file_directory_data(session_id)
            if file_directory:
                return jsonify({"message": "Git processing completed.", "file_directory": file_directory}), 200
            else:
                return jsonify({"message": "Git processing completed, but no file directory found."}), 200
        

    return thread_target()
    

def get_file_directory_data(sessionId: str):
    session_data = collection.find_one({"session_id": sessionId}, {"gitfileslist": 1})
    if session_data:
        return session_data["gitfileslist"]
    else:
        return None
    
@app.route('/get_file_directory/<sessionId>')
def get_file_directory(sessionId: str):
    file_directory = get_file_directory_data(sessionId)
    if file_directory:
        return jsonify({"file_directory": file_directory})
    else:
        return jsonify({"error": f"Session_id: {sessionId} not found"}), 404

@app.route('/newprompt', methods=['POST'])
def chaosbaby():
    session_id = request.cookies.get('sessionId')  # Retrieve sessionId from cookie
    data = request.get_json()

    if 'prompt' in data and session_id:
        data['session_id'] = session_id  # Make sure to include sessionId in the data
        chat_thread = threading.Thread(target=handle_new_prompt, args=(data,))
        chat_thread.start()
        return jsonify({"message": "Processing new prompt..."}), 202
    else:
        return jsonify({"error": "Missing prompt or session_id"}), 400
    
def handle_new_prompt(data):
    prompt = data['prompt']
    session_id = data['session_id']
    # Check the last element in the 'frontend' array in the database
    
    last_entry = collection.find_one({"session_id": session_id}, {"frontend": 1})
    if len(last_entry['frontend']) > 0:
        if last_entry and last_entry['frontend'][-1]['role'] == "assistant" and last_entry['frontend'][-1]['content'] == "Sorry, there was an error choosing files :3":
            # If the last entry is the error message, delete the last two entries (the prompt and the error message)
            collection.update_one({"session_id": session_id}, {"$pop": {"frontend": 1}})
            collection.update_one({"session_id": session_id}, {"$pop": {"frontend": 1}})
        
    collection.update_one({"session_id": session_id}, {"$set": {"status": "processing"}})
    chatmain.newprompt(prompt, session_id)
    collection.update_one({"session_id": session_id}, {"$set": {"status": "completed"}})
    return None

@app.route('/get_messages/<session_id>')
def get_messages(session_id: int) -> dict:
    frontend_messages = []
    messages = collection.find_one({"session_id": session_id})

    if messages and "frontend" in messages:
        messages = messages["frontend"]
        if len(messages) == 0:
            return jsonify({"error": f"Session_id: {session_id} not found/No Messages"}), 404
        num = 1  
        for message in messages:
            frontend_message = {
                "num": num,
                "from": "bot" if message["role"]=="assistant" else "User",
                "content": message["content"]
            }
            frontend_messages.append(frontend_message)
            num += 1  
    else:
        return jsonify({"error": f"Session_id: {session_id} not found/No Messages"}), 404

    return jsonify(frontend_messages)



@app.route('/check_status/<session_id>')
def check_status(session_id: int):
    session_data = collection.find_one({"session_id": session_id}, {"status": 1})
    if session_data and "status" in session_data:
        return jsonify({"status": session_data["status"]})
    else:
        return jsonify({"status": "unknown", "error": f"Session_id: {session_id} not found"}), 404

if __name__ == '__main__':
    app.run(threaded=True, debug=True)

