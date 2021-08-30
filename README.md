# Client-side Encryption
One of the nicest concepts is how you can encrypt everything before it leaves your device. In this tutorial we are going to setup an environment and demonstrate how to achieve the goal.
# The goal
We want to have an encryption vault where we can upload a file. The file will be encrypted before leaving the client. Upon the upload, the interface will give the user a UUID and an encryption key by which they would be able to retrieve the original file. When a download is requested, the encrypted file will be downloaded and then would be encrypted on the user's device. This way, no sensitive information would be transferred and most of the work will be done client-side.

## Step 1: Setting up the development environment

We would be utilizing Docker to setup an Apache-PHP webserver along with a MySql server for storing the uploaded entries. The following code will got to the `docker-compose.yml` file.
```
version: '3.8'
services:
    php-apache-environment:
        container_name: php-apache
        build:
            context: ./php
            dockerfile: Dockerfile
        depends_on:
            - db
        volumes:
            - ./php/:/var/www/html/
        user: nobody
        ports:
            - 8000:80
    db:
        container_name: db
        image: mysql
        restart: always
        environment:
            MYSQL_ROOT_PASSWORD: MYSQL_ROOT_PASSWORD
            MYSQL_DATABASE: MYSQL_DATABASE
            MYSQL_USER: MYSQL_USER
            MYSQL_PASSWORD: MYSQL_PASSWORD
        ports:
            - "9906:3306"
```
`Note` We have mapped a folder named `php` to the document root of the webserver so that we can easily tranfer files to the environment. We will also start the server as `nobody`, so you will have to make a folder named `uploads` and change its ownership to `nobody`. In the folder where you have cloned this repo:
```
mkdir -p php/uploads
chown -R nobody php/uploads
```
As well as these steps, the MySql credentials and the ports have been supplied here. 
In order to make the containers work together, an extra step would be required. Inside the `php` folder create a text file named Dockerfile where you will put the following:
```
FROM php:8.0-apache
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli pdo pdo_mysql
RUN apt-get update && apt-get upgrade -y
```
Finally you can fire up the web system by `docker-compose up`.

## Step 2: NodeJS and the needed programs for JS coding
The whole thing could be done from within NodeJS but I opted for having q separate webserver and DB. Using NodeJS we would developt the codes and then prepare them for the web setup. 
The library we want to utilize is [Enigma](https://github.com/cubbit/enigma). It provides us with the tools to encrypt web streams and many other things. The library itself uses NodeJS run-time environment and TypeScript so in order to make the final code run in our browser, we would need to convert the codes to JavaScript. For this reason, we will install the library along with [Browserify](https://browserify.org) and [tsify](https://www.npmjs.com/package/tsify):
```
npm install @cubbit/enigma @cubbit/web-file-stream browserify tsify
```
