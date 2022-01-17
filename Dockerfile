# syntax=docker/dockerfile:1

FROM node:17.1.0

# ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
COPY "initialise-bot.sh" .

RUN npm install
RUN chmod +x initialise-bot.sh

COPY . .
CMD [ "sh", "./initialise-bot.sh" ]