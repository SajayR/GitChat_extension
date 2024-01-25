# GitChat: A Web Interface for Understanding Codebases

GitChat is a web application tailored to facilitate conversations around large codebases by providing an interactive chat interface through which users can ask questions about the code. The application employs OpenAI's GPT models to interpret user inquiries and to reference relevant parts of the codebase, enhancing the understandability of massive projects.

## Key Features

- Chatbot interface to interact and ask questions on a massive codebase.
- Integration with GitHub to fetch repositories and analyze code.
- A web-based frontend built with React, providing a user-friendly experience.
- Backend support using Flask to manage requests and leverage the OpenAI API for natural language understanding.

## Project Structure

The GitChat codebase comprises several key components, as outlined below:

- `Backend`: A Flask-powered server that handles requests and communicates with the OpenAI API and MongoDB for session management.
  - `OpenAI`: Contains modules such as `callgpt.py` for interacting with the OpenAI API to process user questions and `daddy.py` which orchestrates the fetching of relevant code given a user’s prompt.
  - `GitScripts`: Scripts like `extracting.py` for extracting repository contents from GitHub and `gitmain.py` to manage the retrieval and processing of the Git repository structure.
  - `main.py`: The Flask application entry point that sets up the server and endpoints.

- `Frontend`: The user interface created with React.
  - `src`: Contains the source code of the React application, including `App.js` which is the main component handling user interactions and display logic.

## Dependencies

- Frontend: React.js, Axios, React-DOM, js-cookie, uuid
- Backend: Flask, PyMongo, OpenAI, Python-dotenv
- Database: MongoDB
- External: OpenAI API, GitHub API

## Getting Started

To get GitChat up and running, follow the steps below for setup:

### Backend Setup

1. Navigate to the `Backend` directory.
2. Ensure MongoDB is running on your local machine.
3. Set up the necessary environment variables, including your OpenAI API key.
4. Start the Flask server: `python main.py`.

### Frontend Setup

1. Navigate to the `Frontend` directory.
2. Run `npm install` to install the necessary node modules.
3. Set Environment Variables for frontend as necessary.
4. Start the React app using `npm start`.

## Usage

Once both the frontend and backend are set up, open your web browser and go to `http://localhost:3000` (or the port you specified) to access GitChat. Here, users can:

- Enter a GitHub repository URL to fetch the codebase.
- Post questions or prompts in the chat interface.
- Review the chatbot's responses and suggested sections of the code.
- Navigate the directory of the fetched GitHub repository.

## API Reference

A partial API reference is as follows:

- `/gitget`: POST request to fetch files from a Git repository.
- `/newprompt`: POST request to send a new prompt to the backend.
- `/get_messages/<session_id>`: GET request to retrieve chat messages for a session.
- `/check_status/<session_id>`: GET request to check the status of processing for a session.

Use a REST client like Postman or browser extensions to interact with these APIs.

## Database Schema

The MongoDB schema for session storage consists of the following:

- `session_id`: A unique identifier for each user session.
- `user`: GitHub username.
- `repo`: Repository name.
- `gitfileslist`: List of file paths in the repository.
- `frontend`: Frontend chat messages.
- `prompts`: User prompts and system messages.

## Contributing

We welcome contributions to GitChat. If you'd like to contribute, please fork the repository and create a pull request, or you can open an issue with the tag "enhancement."

## License

GitChat is open-source software licensed under the MIT license.

## Contact

For more information or support, please submit an issue in the project's GitHub repository: [SajayR/GitChat.git](https://github.com/SajayR/GitChat).

This README serves as an overall guide to the GitChat project. Specific instructions for running the frontend and backend separately can be found in their respective README.md documents within their directories.
