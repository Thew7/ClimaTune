# ClimaTune Alarm Clock
This is a modern alarm clock application built with React and Vite, featuring a responsive design styled with Tailwind CSS. It includes core clock functionalities (Alarm, Timer, Stopwatch) and integrates with Spotify to play weather-appropriate music when an alarm is triggered.

## Local Installation & Setup
Follow these steps to get a copy of the project running on your local machine for development and testing.

### Prerequisites
Node.js & npm: This is the essential JavaScript runtime and package manager needed to install dependencies and run the application.
Download Link: [Download Node.js](https://nodejs.org/en/download/) (Install the latest LTS version)

### Step 1: Get the Code (Download ZIP)
1. Go to the repository page on GitHub.
2. Click the **green < >** Code button.
3. Click "**Download ZIP**" and save the file to your computer.
4. Unzip the file to your desktop. This will create a folder, named **ClimaTune-main**.
5. Inside that folder is another folder named **ClimaTune-main**, this holds our **client** & **documents** folders.
6. **documents** holds the project documents (i.e., User Manual & Developers Guide)

### Step 2: Install Dependencies
You must use the command line to install the necessary JavaScript libraries (React, Tailwind, etc.) that the application relies on.
1. Open your command prompt.
2. Navigate into the project's client folder. This is the directory that contains the package.json file:
   - cd Desktop/ClimaTune-main/ClimaTune-main/client
3. Run the following command:
   - npm install

### Step 3: Run the Application
The application uses the Vite development server.
1. In the same ClimaTune-main/client directory, start the server
   - npm run dev
2. You should now see "VITE v7.2.2 ready" in the command prompt
3. To open the project, paste the following URL into your web browser.
   - http://127.0.0.1:5173/

## Spotify Integration
To enable music playback on your alarms:
1. Navigate to the "Music" tab in the running application.
2. Click the "Log in with Spotify" button and follow the prompts to authorize the app.
   - Note: Music playback requires a Spotify Premium account and an active Spotify device (like the desktop app) to be open.
