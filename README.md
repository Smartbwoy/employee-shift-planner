# Employee Shift Planner

## Project Description

The Employee Shift Planner is a modern web application designed to help managers and team leaders efficiently schedule and manage employee shifts. This project aims to streamline the process of shift planning, ensuring that all shifts are covered and that employees are assigned shifts that fit their availability and preferences.

## Features

- **Interactive Calendar Interface**: 
  - Drag-and-drop shift scheduling
  - Week, month, and day views
  - Color-coded employee assignments
  - Real-time updates

- **Employee Management**:
  - Add and manage employee profiles
  - Track employee availability
  - Set employee preferences
  - View employee schedules

- **Shift Management**:
  - Create, edit, and delete shifts
  - Assign employees to shifts
  - Set shift duration and breaks
  - Add shift notes and requirements

- **Export & Reporting**:
  - Export schedules to PDF and Excel
  - Print schedules
  - Generate employee hours reports
  - Track shift coverage

- **Notifications**:
  - Email notifications for shift assignments
  - SMS notifications (optional)
  - Shift change alerts
  - Reminders for upcoming shifts

## Tech Stack

- **Frontend**:
  - React.js
  - React Query for data fetching
  - React Big Calendar for scheduling
  - React Bootstrap for UI components
  - React Color for color picking
  - jsPDF and xlsx for exports

- **Backend**:
  - RESTful API
  - Node.js/Express
  - MongoDB/PostgreSQL
  - JWT Authentication

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/employee-shift-planner.git
    ```
2. Navigate to the project directory:
    ```bash
    cd employee-shift-planner
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Set up environment variables:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file with your configuration.

## Development

1. Start the development server:
    ```bash
    npm start
    ```
2. Open your browser and navigate to `http://localhost:3000`.

## Building for Production

1. Build the application:
    ```bash
    npm run build
    ```
2. The built files will be in the `build` directory.

## API Documentation

The API documentation is available at `/api-docs` when running the development server. It includes:
- Authentication endpoints
- Employee management endpoints
- Shift management endpoints
- Reporting endpoints

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_AUTH_TOKEN`: Authentication token
- `REACT_APP_EMAIL_SERVICE`: Email service configuration
- `REACT_APP_SMS_SERVICE`: SMS service configuration

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more information.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

### Code Style

- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Include tests for new features

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Deployment

The application can be deployed to various platforms:
- Vercel
- Netlify
- AWS Amplify
- Heroku

See the [Deployment Guide](DEPLOYMENT.md) for detailed instructions.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For any questions or suggestions, please:
- Open an issue on GitHub
- Contact us at [support@shiftplanner.com](mailto:support@shiftplanner.com)
- Join our [Discord community](https://discord.gg/shiftplanner)

## Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with payroll systems
- [ ] AI-powered shift optimization
- [ ] Multi-language support