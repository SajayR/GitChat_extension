GitChat: A Web Interface for Understanding Codebases

## Overview

GitChat is a Chrome Extension designed for developers to better understand and navigate large codebases. This tool leverages the power of OpenAI's GPT models to provide an interactive chat interface where users can ask questions about code and unearth insights through meaningful conversation. The codebase splits into a backend built with Flask in Python and a frontend constructed in React.

## Key Features
- Interactive chat interface that integrates with GitHub repositories.
- Natural language processing capabilities thanks to OpenAI's GPT models.
- Extension capabilities allowing users to work directly within the Chrome browser.

## Technical Architecture
### Backend
- **Flask Application:** Entrypoint is `main.py` where the Flask server and API endpoints are configured.
- **OpenAI Integration:** `callgpt.py` interfaces with the OpenAI API for generating responses using natural language understanding.
- **Session Management:** MongoDB is used to store session information including chat logs and repository data.

### Frontend
- **React Application:** The `src/app.js` file serves as the starting point for the frontend application, managing state and user interactions.

## Dependencies
- Frontend: React.js (v17+), Axios, React-DOM, js-cookie, uuid
- Backend: Flask (v1.1.2), PyMongo, OpenAI API, Python-dotenv
- Database: MongoDB (v4.0+)
- External APIs: GitHub, OpenAI GPT

## Future Enhancements ✅
- [ ] Adding Multiple chat histories
- [ ] Moving to TogetherAI API for lower costs(will have to adjust for different output styles)
- [ ] Implementing ColBERT(Provided enough computation)
- [ ] Better UI
- [ ] Better User Management, chat limits etc.
- [ ] Different Backend Server

##License
GitChat is released under the MIT License. This license grants you permission to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, provided that the above copyright notice and this permission notice are included in all copies or substantial portions of the software.

The MIT License is a permissive license that is short and to the point. It lets people do anything they want with your code as long as they provide attribution back to you and don’t hold you liable.

##Contact
For any inquiries or feedback regarding GitChat, feel free to reach out.

Twitter: [SajayRRR](https://twitter.com/SajayRRR)
Email: techrend08@gmail.com
Your thoughts and suggestions are always welcome as they help us improve and evolve GitChat.

##Acknowledgments
Special thanks to my teammates, [Ryyan](https://github.com/ryyan2407)  and [Dhruval](https://github.com/dhruval30), for their invaluable contributions during the DevStorm Hackathon. Their expertise and dedication were pivotal in building the first webapp prototype of GitChat. Their collaborative spirit and technical prowess have significantly shaped the development of this project.


