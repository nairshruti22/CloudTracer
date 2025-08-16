Welcome to CloudTracer!
This repository hosts a full-stack application designed to help bioinformaticians visualize and analyze EC2 cloud cost waste. By providing an intuitive user interface, the project empowers users to explore server utilization patterns and make informed infrastructure decisions—without needing deep knowledge of cloud architecture.

CloudTracer includes both frontend and backend codebases:

- The frontend is a React (Vite) application for interactive data visualization.
- The backend is a Node.js (Express) API that integrates with AWS to retrieve and process cloud usage data.

This tool aims to simplify cloud cost management and promote smarter resource allocation for research teams.

## Project Structure

```
/
├── frontend/   # React (Vite) application
├── backend/    # Node.js (Express) API
└── README.md   # Main project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- AWS account (for backend integration)

### Installation

1. **Clone the repository:**

   ```bash
   git clone [path](https://github.com/nairshruti22/CloudTracer.git)
   cd CloudTracer
   ```

2. **Install dependencies for frontend and backend:**
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```
3. **Set up AWS environment variables and integration:**

The backend connects to your AWS account to retrieve data only if valid AWS credentials are provided.

Note:
If you skip this step or leave .env unchanged, the backend will serve mock data by default, so you can try the app without needing AWS setup right away.

- Copy `.env.example` to `.env` in the `backend` folder:
  ```bash
  cp backend/.env.example backend/.env
  ```
- Edit `backend/.env` and provide your AWS credentials:
  ```env
  AWS_ACCESS_KEY_ID=your_aws_access_key_id
  AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
  AWS_REGION=us-east-1
  ROLE_ARN=arn:aws:iam::your_account_id:role/your_role_name
  ```

#### Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on [http://localhost:5173]

#### Backend

Open a new terminal window for the backend. Both the frontend and backend should be run in separate terminals to ensure they operate concurrently.
By default, the server returns mock data unless valid AWS credentials are set in .env.

```bash
cd backend
npm start
```

The backend API will start on [http://localhost:4000]

## Folder Details

- **frontend/**: Contains the React application built with Vite.
- **backend/**: Contains the Express API and AWS integration logic.

## Contributing

Feel free to open issues or submit pull requests for improvements.

## License

This project is licensed under the MIT License.
