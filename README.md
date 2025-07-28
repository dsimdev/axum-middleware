# Node API App

This project is a simple Node.js application that connects to an external API to retrieve data related to `Cliente`, `padroniibb`, and `percepcioniibb`. It is structured to provide a clear separation of concerns, with dedicated files for the server setup, API interactions, and utility functions.

## Project Structure

```
node-api-app
├── src
│   ├── index.js          # Entry point of the application
│   ├── api
│   │   └── client.js     # API client for fetching data
│   └── utils
│       └── helpers.js    # Utility functions for data processing
├── package.json          # NPM configuration file
└── README.md             # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd node-api-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run the following command:
```
node src/index.js
```

The server will start and listen for incoming requests.

## API Endpoints

- **GET /api/client**: Retrieves client information.
- **GET /api/padroniibb**: Retrieves padroniibb data.
- **GET /api/percepcioniibb**: Retrieves percepcioniibb data.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.

## License

This project is licensed under the MIT License.