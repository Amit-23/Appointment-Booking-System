# Appointment Booking System

A full-stack web application for booking appointments—primarily for doctors, but extendable to other freelancers (such as software developers). The system supports professional registration, client search and booking, and streamlined appointment management.

## Features

- **Professional Registration:** Doctors and freelancers can register and manage their service offerings.
- **Client Search & Booking:** Clients can search for available professionals and book services for specific dates.
- **Appointment Management:** Professionals review, accept, or reject appointment requests.
- **Authentication:** Secure user authentication using JWT (JSON Web Tokens).
- **REST API:** Backend powered by Django and Django REST Framework (DRF) for robust API development.
- **Modern Frontend:** Built with ReactJS for a responsive client experience.

## Tech Stack

- **Backend:** Python, Django, Django REST Framework (DRF), JWT
- **Frontend:** ReactJS

## Project Structure

```
backend/
  appointmentHub_backend/
    appointmentHub_backend/
      __init__.py
      asgi.py
      settings.py
      urls.py
      wsgi.py
    authentication/
      ... (auth logic)
    manage.py
    requirements.txt
frontend/
  (ReactJS project)
```

## Setup Instructions

### Backend (Django + DRF)

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Amit-23/Appointment-Booking-System.git
    cd Appointment-Booking-System/backend/appointmentHub_backend
    ```

2. **Set up a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. **Install backend dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4. **Apply migrations:**
    ```bash
    python manage.py migrate
    ```

5. **Run the development server:**
    ```bash
    python manage.py runserver
    ```

### Frontend (ReactJS)

1. **Navigate to the frontend directory and install dependencies:**
    ```bash
    cd ../../frontend
    npm install
    ```

2. **Start the React development server:**
    ```bash
    npm start
    ```

## Authentication

- Uses JWT (JSON Web Token) for secure authentication.
- Endpoints for login, registration, and token refresh are provided in the backend using Django REST Framework.

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements, features, or bug fixes.

## Author

- **Amit-23** ([GitHub Profile](https://github.com/Amit-23))

## License

This project is licensed under the MIT License.
