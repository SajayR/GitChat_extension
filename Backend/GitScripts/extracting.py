import requests
from requests.auth import HTTPBasicAuth
import os 
import re
import base64
from pymongo import MongoClient
import subprocess
   

# Get the directory of the current script
script_dir = os.path.dirname(os.path.realpath(__file__))

client = MongoClient('mongodb://localhost:27017/')
db = client.GitChat
collection = db.ChatStorage


def process_direc_for_filenames(link, session_id):
    # Clone the repository into a folder named "ClonedUserRepo"
    clone_dir = os.path.join(script_dir, 'ClonedUserRepo', session_id)
    subprocess.run(['git', 'clone', link, clone_dir], check=True)

    file_paths = []
    for root, dirs, files in os.walk(clone_dir):
        for file in files:
            # Construct the file path relative to the session_id directory
            file_path = os.path.relpath(os.path.join(root, file), clone_dir)
            file_paths.append(file_path)

    # Remove the "ClonedUserRepo" directory after processing
    #subprocess.run(['rm', '-rf', 'ClonedUserRepo'], check=True)
    
    return file_paths

def get_local_file_contents(file_path):
    try:
        with open(file_path, 'r') as file:
            return file.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None
    
def get_file_prompt(session_id, file_paths):
    all_contents = ""
    cloned_repo_path = os.path.join(script_dir, 'ClonedUserRepo', session_id)
    owner = collection.find_one({"session_id": session_id})["user"]
    repo = collection.find_one({"session_id": session_id})["repo"]
    all_contents += f"\n#Repo Name: {owner}/{repo} \n "
    for file_path in file_paths:
        # Get the contents of the file stored locally
        full_file_path = os.path.join(cloned_repo_path, file_path)
        file_text = get_local_file_contents(full_file_path)

        # Skip if file_text is None or empty
        if not file_text:
            print(f"Could not fetch content for {file_path}")
            continue
        all_contents += f"###File Name: {file_path}\n###Content: \n{file_text}\n\n"

    return all_contents if len(all_contents) <60000 else all_contents[:60000]


