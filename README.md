# apollo-federation-example
GraphQL Apollo Federation Example with multiple microservices and an API gateway


## Installation
Clone down the repository into your workspace
```
git clone
```
Change to the directory root
```
cd apollo-federation-example
```
Install dependencies
```
npm run install-all
```

## Start services
Order in important here to ensure federation does not error. Open each command in another terminal tab/window.

Start review service
```
npm run start-review-service
```
Start user service
```
npm run start-user-service
```
Start gateway
```
npm run start-gateway
```

## Explore and test GraphQL services
Open http://localhost:4000/ in [GraphQL Playground](https://github.com/prisma/graphql-playground) to observe and schema and run queries.


