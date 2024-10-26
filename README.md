# Zeotap Intern Assignment - Application 2
## Real-Time Data Processing System for Weather Monitoring with Rollups and Aggregates

## Walkthrough:
https://github.com/user-attachments/assets/22b5ae0b-2eb8-4dde-af84-de4c83a4120b

## Features:
- Created a real-time data processing system to monitor weather conditions and provide summarized insights using rollups and aggregates.
- Facilitates real-time weather updates for user-given cities by updating data every 5 minutes.
- Provides daily summaries such as minimum temperature, maximum temperature and dominant weather for each city.
- Dominant weather is chosen as the most frequent weather type for the city in a day, for example: if for Delhi, "Haze" has the most frequency in a day, so dominant weather for that day will be "Haze".
- Alerts user when threshold is breached, as configured by user.
- Simple UI for user readability.

## Technologies Used:
- Frontend: ReactJS, CSS
- Backend: NodeJS, ExpressJS
- Database: MySQL

## Installation:
- Clone repository:
  git clone https://github.com/devanshi-1212/Zeotap-Application-2.git
- Install dependencies:
  npm install
- Setup MySQL database and modify database configuration in .env
- Run the application now:
  npm start
- Open browser and visit:
  https://localhost:3000
