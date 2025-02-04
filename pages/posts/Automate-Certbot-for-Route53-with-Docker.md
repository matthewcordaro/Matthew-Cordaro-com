---
title: "Automating Cert updates with Certbot for Route53 with Docker"
date: 2025/2/3
description: How to automate getting wildcard certificate with Certbot using Route53 with a locally run docker image.
tag: AWS, docker, certbot, certificate
author: Matthew Cordaro
---

# Automating Cert updates with Certbot for Route53 with Docker 

Something to say about the project...

THIS IS FOR WILDCARD ONLY.

## All the variables

Volume name, aws credentials, main cert.

## All Required Files:

Let's create and populate these files.
```sh
touch Dockerfile docker-compose.yml renew-cert.sh start.sh crontab certbot-route53.yaml
```


### `Dockerfile`

   ```Dockerfile
   # Use the official Alpine image as a base
   FROM alpine:latest
   
   # Install dependencies
   RUN apk add --no-cache \
   curl \
   dcron \
   certbot \
   certbot-dns-cloudflare \
   certbot-dns-route53 \
   tzdata
   
   # Add crontab file in the cron directory
   COPY crontab /etc/crontabs/root
   
   # Add the script to run Certbot
   COPY renew-cert.sh /renew-cert.sh
   
   # Copy the credentials file into the container
   COPY certbot-route53.yaml /run/secrets/certbot-route53.yaml
   
   # Add the start-up script
   COPY start.sh /start.sh
   
   # Ensure the /cert directory exists
   RUN mkdir -p /cert
   
   # Create the log file to be able to run tail
   RUN touch /var/log/cron.log
   
   # Give execute permission to the scripts
   RUN chmod +x /renew-cert.sh /start.sh
   
   # Run the start-up script
   CMD ["sh", "/start.sh"]
   ```


### `docker-compose.yml`
   ```yaml
   services:
   certbot:
   build: .
   container_name: certbot-scheduler
   volumes:
   - VOLUME_NAME:/cert
   environment:
   - TZ=EST
   - DOMAIN=*.cordaro.us
   - EMAIL=cordaro.matthew@gmail.com
   restart: always
   
   volumes:
   VOLUME_NAME:
   external: true
   ```


### `renew-cert.sh`

```sh
#!/bin/sh

CERT_DIR="/cert"

# Read AWS credentials from the copied file and sanitize them
AWS_ACCESS_KEY_ID=$(grep 'accessKeyID' /run/secrets/certbot-route53.yaml | awk '{print $2}' | tr -d '"')
AWS_SECRET_ACCESS_KEY=$(grep 'secretAccessKey' /run/secrets/certbot-route53.yaml | awk '{print $2}' | tr -d '"')

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY

# Run Certbot to renew the certificate, capturing stdout and stderr with verbose output
certbot certonly --dns-route53 -d "$DOMAIN" --non-interactive --agree-tos --email "$(echo $EMAIL | tr -d '[:space:]')" -v --deploy-hook "cp /etc/letsencrypt/live/cordaro.us/fullchain.pem /etc/letsencrypt/live/cordaro.us/privkey.pem $CERT_DIR/"
```


### `start.sh`

```sh
#!/bin/sh

# Start the cron daemon in the foreground
crond -f -l 2 &

# Keep the container running and show the logs
tail -f /var/log/cron.log
```


### `crontab`

```sh
0 8 * * * /renew-cert.sh >> /var/log/cron.log 2>&1
```


## Create the Volume

```sh
docker volume create VOLUME_NAME
```


## Build and deploy the container
```sh
docker-compose down
docker-compose up --build -d
```

This should set up your environment and deploy the container.