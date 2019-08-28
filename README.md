# Apollo Federation Example

GraphQL Apollo Federation Example using multiple federated microservices with corresponding API Gateways. This repo assumes you have basic knowledge of GraphQL.

## Installation

Clone down the repository into your workspace

```bash
git clone https://github.com/supercycle91/apollo-federation-example.git
```

Change to the directory root

```bash
cd apollo-federation-example
```

Install dependencies

```bash
npm i -g serverless && npm run install-all
```

## Start services

Order in important here to ensure federation does not error. Open each command in another terminal tab/window.

Start Review service

```bash
# in a new terminal tab/window
npm run start-review-service
```

Start User service

```bash
# in a new terminal tab/window
npm run start-user-service
```

Start Gateway

```bash
# in a new terminal tab/window
npm run start-gateway
```

## Explore and test GraphQL services

Open http://localhost:4000/graphql in [GraphQL Playground](https://github.com/prisma/graphql-playground) to observe and schema and run queries.

## Deployment

Order is important in deployment and we will need to use the endpoint's assigned by API Gateway as ENVIRONMENT variables when deploying our Gateway. Serverless uses [AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/) through the [AWS CLI](https://aws.amazon.com/cli/). Follow listed instructions in their corresponding order.

Deploy Review service

```bash
# will return endpoint to use for deployment of Gateway
npm run deploy-review-service
```

Deploy User service

```bash
# will return endpoint to use for deployment of Gateway
npm run deploy-user-service
```

Deploy Gateway service

```bash
# insert endpoints provided in last two commands
REVIEW_SERVICE_URL=<insert APIGW endpoint> USER_SERVICE_URL=<insert APIGW endpoint> npm run deploy-gateway
# this command if successful will return your final Gateway URL that you can begin sending queries to
```
