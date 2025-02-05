---
title: "Rolling My Own Container Registry"
date: 2025/2/4
description: How to setup your own public facing container registry
tag: Docker, Web-Certs 
author: Matthew Cordaro
---

# How to roll your own Docker Registry

For the record I ran this once successfully before realizing that I was going to reverse proxy my entire setup.  So 
this post is probably 95-98% accurate.  Going to 

## Volume for Certificates
If you haven't done so already, create a volume and make sure the certificates are located in it.

```sh
docker volume create certs
docker cp /PATH/TO/DOMAIN.crt /certs/
docker cp /PATH/TO/DOMAIN.key /certs/
```

Replace `/PATH/TO/DOMAIN.crt` and `/PATH/TO/DOMAIN.key` with the path to and name of the cert and key.

## Run the Registry with Certificates
Start the Docker registry container and mount the volume containing the certificates.

```sh
docker run -d \
  -p 5000:5000 \
  --name registry \
  -v certs:/certs \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/DOMAIN.crt \
  -e REGISTRY_HTTP_TLS_KEY=/certs/DOMAIN.key \
  registry:2
```

Replace `DOMAIN.crt` and `DOMAIN.key` with the name of the cert and key.

At this point your registry should be up and running properly.

**The next step is only necessary if you are not using a cert from a trusted Certificate Authority, like a self signed cert.**

## Not Required: Configure Docker to Use Private Certificates

If a trusted Certificate Authority is not the signer of the certs, the cert will need to be installed in order to be trusted by Docker.  This isn't strictly necessary. However, warnings can be avoided by taking the following certificate installation steps.

Create a directory on the OS hosting Docker, where Docker can find the certificates, and copy the certificates to the Docker directory.

```sh
mkdir -p /PATH/TO/docker/certs.d/localhost:5000
cp /PATH/TO/certs/DOMAIN.crt /PATH/TO.docker/certs.d/localhost:5000/ca.crt
```

Replace `/PATH/TO/docker` with the path of the docker installation and `/PATH/TO/DOMAIN.crt` with the path to and name of the cert.

Update Docker Daemon Configuration at `/etc/docker/daemon.json` file to include the registry as an insecure registry.

```json
{
  "insecure-registries" : ["localhost:5000"]
}
```

Then, restart the Docker service to apply the changes.

```sh
sudo systemctl restart docker
```

## Test the Registry
1. Get a test image from Docker Hub and test it.
   ```
   docker pull hello-world
   docker run hello-world
   ```

2. Login to, tag, & push the image to the registry.

   ```sh
   docker login localhost:5000
   docker tag hello-world localhost:5000/hello-world
   docker push localhost:5000/hello-world
   ```

3. Pull the image and test.

   ```sh
   docker pull localhost:5000/your-image:latest
   docker run localhost:5000/hello-world
   ```
