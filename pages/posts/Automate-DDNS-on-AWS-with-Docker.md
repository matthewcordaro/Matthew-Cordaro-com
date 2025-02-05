---
title: "Automate DDNS on AWS with Docker"
date: 2025/2/3
description: How to get DDNS on AWS's Route53 working fast with a automated locally run docker image
tag: AWS, Docker, Dns, 
author: Matthew Cordaro
---

# Automate DDNS on AWS with Docker

How to get DDNS on AWS's Route53 working fast with a automated locally run docker image.  This is perfect for a home server!

1. Create a folder like `ddns-aws-route53` to put the following configs on your computer with docker.

2. In AWS, create a user in IAM with the following policy.  Make sure to replace `HOSTED_ZONE_ID` with your Route53 Hosted zone ID for the domain you wish to update.  This policy allows you to change any and all records for the domain. You may wish to restrict this further.  Finally, generate access keys for this new user.

   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Action": [
                   "route53:ChangeResourceRecordSets",
                   "route53:ListResourceRecordSets"
               ],
               "Effect": "Allow",
               "Resource": "arn:aws:route53:::hostedzone/HOSTED_ZONE_ID"
           }
       ]
   }
   ```

3. Create a `ddns-route53.yml` file in the `ddns-aws-route53` folder with the template below. Repuace `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY` with the credentials from the previous step  Also, include the `HOSTED_ZONE_ID` and corresponding `DOMAIN_NAME`. **Do not delete the trailing `.`.**

   ```yaml
   credentials:
     accessKeyID: "ACCESS_KEY_ID"
     secretAccessKey: "SECRET_ACCESS_KEY"
   route53:
     hostedZoneID: "HOSTED_ZONE_ID"
     recordsSet:
       - name: "DOMAIN_NAME."
         type: "A"
         ttl: 300
   ```
4. Create a `docker-compose.yml` file.  Update the `TZ` as needed

   ```yaml
   version: "3.5"
   services:
     ddns-route53:
       image: crazymax/ddns-route53:latest
       container_name: ddns-route53
       volumes:
         - "./ddns-route53.yml:/ddns-route53.yml:ro"
       environment:
         - "TZ=America/New_York"
         - "SCHEDULE=*/5 * * * *"
         - "LOG_LEVEL=info"
         - "LOG_JSON=false"
       restart: always
   ```
5. Run `docker compose up -d` while in the `ddns-aws-route53`. This will start the ddns-route53 container with the settings from your configuration file.  Check the logs for any errors.

_Note: You may need to actually create the entry first in order to update it.  Go to Route53 and create the A record for your `DOMAIN_NAME` from before and give it a made up address.  Rerun your container and then refresh Route53 to see if the update applied with the correct IP._


OG documentation on the docker container is [here](https://crazymax.dev/ddns-route53/install/docker/) for reference but a bit out dated.