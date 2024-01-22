# GitChat Codebase Documentation

Welcome to the GitChat codebase. This document provides a comprehensive overview of the project structure, setup instructions, and other relevant information for developers.

## Overview

GitChat is a web application that allows users to interact with a chatbot for assistance with codebase-related queries. The frontend is built with React and styled using CSS, while the backend services are not included in the provided snippets.

## Project Structure

The project is divided into two main directories:

- `Frontend`: Contains all the React components, styles, and assets for the user interface.
- `Backend`: Contains the flask server-side logic.

### Frontend Structure

- `public`: Static files.
- `src`: Source code for the React application, including components, styles, and utility functions.
  - `App.js`: The main React component that orchestrates the user interface.
  - `App.css`: Global styles for the application.
  - `index.js`: Entry point for the React application.
  - `GithubPopup.js`: A React component for the GitHub URL submission popup.

## Setup Instructions

To get started with the frontend:

1. Navigate to the `Frontend` directory.
2. Install dependencies with `npm install`.
3. Start the frontend development server with `npm start`.
4. Navigate to the 'Backend' directory
5. Start the backend server with 'python main.py'
   
## Available Scripts

- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner.
- `npm run build`: Builds the app for production.
- `npm run eject`: Ejects the app from the create-react-app build tool.

## Deployment

Refer to the `create-react-app` [deployment documentation](https://facebook.github.io/create-react-app/docs/deployment) for instructions on deploying the application.

## License

The project is licensed under the MIT License. See the `LICENSE` file in the `Frontend` directory for full license text.

## Contributing

Contributions are welcome. Please follow the existing code style and submit a pull request for review.

## Contact

For any further questions or requests, please open an issue in the repository or contact the repository owner directly.
