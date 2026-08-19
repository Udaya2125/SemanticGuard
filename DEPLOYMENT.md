# AWS Deployment Guide

This guide provides instructions for deploying the SemanticGuard application to AWS using the AWS Serverless Application Model (SAM).

## AWS Architecture

The application is deployed using a simple serverless architecture:

-   **React Frontend:** Hosted on S3 and served via CloudFront.
-   **FastAPI Backend:** Deployed as an AWS Lambda function, fronted by an API Gateway.
-   **Audit Storage:** A DynamoDB table is used to store audit logs.

## Prerequisites

-   AWS CLI configured with your credentials.
-   AWS SAM CLI installed.
-   Docker installed and running.
-   A valid Gemini API key.

## Deployment Steps

### 1. Configure Gemini API Key

NEVER commit your Gemini API key to your code. We will store it securely in AWS Secrets Manager.

```bash
aws secretsmanager create-secret \
    --name SemanticGuardGeminiApiKey \
    --description "Gemini API Key for SemanticGuard" \
    --secret-string "YOUR_GEMINI_API_KEY"
```

Take note of the `ARN` of the secret that is created.

### 2. Build the SAM Application

The backend code, including its dependencies, needs to be packaged for Lambda.

```bash
sam build
```

### 3. Deploy the SAM Application

Deploy the packaged application to AWS. You will be prompted for some parameters.

```bash
sam deploy --guided
```

When prompted, provide the following:

-   **Stack Name:** A name for your CloudFormation stack (e.g., `semantic-guard`).
-   **AWS Region:** Your preferred AWS region.
-   **GeminiApiKeySecretArn:** The ARN of the AWS Secrets Manager secret you created in step 1.
-   **Confirm changes before deploy:** `y`
-   **Allow SAM CLI IAM role creation:** `y`
-   **Save arguments to samconfig.toml:** `y`

After the deployment is complete, you will see the API Gateway URL in the outputs.

### 4. Deploy the Frontend

The frontend is deployed to an S3 bucket.

First, you need to build the frontend with the correct API URL.

In `frontend/src/LiveTestPage.tsx` (and other pages), change the `fetch` URL to your API Gateway URL.

Then, build the frontend:

```bash
cd frontend
npm run build
```

Now, you can manually upload the contents of the `frontend/dist` directory to an S3 bucket configured for static website hosting.

*(Note: A more advanced setup would automate this process, including CloudFront distribution.)*

## AWS Cleanup

To remove the deployed application and all its resources, run the following command:

```bash
sam delete
```
This will delete the entire CloudFormation stack. You will also need to manually delete the S3 bucket and the AWS Secrets Manager secret.
