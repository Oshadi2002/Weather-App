# Weather App

A full-stack weather application that provides real-time weather information with user authentication functionality.

## Features

- User Authentication (Login/Signup)
- Real-time weather information display
- Responsive design
- Weather cards with detailed information
- Secure API integration

## Tech Stack

### Frontend
- React.js
- CSS3
- Context API for state management
- React Router for navigation

### Backend
- Node.js
- Express.js
- JSON data storage

## Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/Oshadi2002/Weather-App.git
cd Weather-App
```

2. Setup Backend:
```bash
cd Backend
npm install
```

3. Setup Frontend:
```bash
cd Frontend
npm install
```

## Running the Application

1. Start the Backend server:
```bash
cd Backend
npm start
```
The server will start running on http://localhost:5000 (or your configured port)

2. Start the Frontend application (in a new terminal):
```bash
cd Frontend
npm start
```
The application will open in your default browser at http://localhost:3000

## Project Structure

```
├── Backend/                # Backend server files
│   ├── data/              # JSON data storage
│   └── server.js          # Main server file
│
└── Frontend/              # React frontend
    ├── public/            # Static files
    └── src/               # Source files
        ├── Apis/          # API integration
        ├── assets/        # Images and media
        ├── components/    # React components
        ├── context/       # Context providers
        └── pages/         # Application pages
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
