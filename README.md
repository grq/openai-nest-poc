# Fine Tune Manager Backend

This is the backend of Fine Tune Manager, a tool for managing AI training data and generating training files for fine-tuning models.
It supports:
1. Managing and fine-tuning multiple AI models using the OpenAI API;
2. Chatting with user's models and validating JSON responses to match the user-defined format;
3. Converting speech into text prompts using the OpenAI Whisper API;
4. Editing and organizing training data into structured files;
5. Importing training data from JSON files;
6. Uploading training files to the OpenAI API for training new models or reusing them across different models.

## Installation

To install all dependencies, run:

```sh
npm install
```

## Configuration

Before running the project, create a `.env` file in the root directory and add the following environment variables:

```ini
# OpenAI API Key for fine-tuning and AI model interactions
OPENAI_API_KEY=your-openai-api-key

# Paths for storing various types of files
JSON_FILES_PATH=../flai/jsonTrainingData
TRAINING_FILES_PATH=../flai/training-files
DOCS_FILES_PATH=../flai/docs/td

# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
FIREBASE_APP_ID=your-firebase-app-id
```

## Running the Project

To start the development server:

```sh
npm run dev
```

For production mode:

```sh
npm start
```

## Building the Project

To compile the NestJS application, use:

```sh
npm run build
```

This will generate the compiled files in the `dist` directory.

## Linting

To check for linting issues:

```sh
npm run lint
```

To automatically fix linting errors:

```sh
npm run lint:fix
```
