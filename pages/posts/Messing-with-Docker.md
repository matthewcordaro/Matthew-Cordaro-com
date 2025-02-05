---
title: "Messing with Docker"
date: 2025/2/4
description: My rambling on my first real from scratch Docker project.
tag: AWS, Docker, Certbot, Web-Certs
author: Matthew Cordaro
---

# Messing with Docker

Born from a need to automate my certificate updates, this [project on GitHub](https://github.com/matthewcordaro/scheduled-certbot-container) was created. It took about 12 hours to complete.

This post is mostly me discussing the hiccups I ran into.

## Volumes

When Docker creates volumes, it defaults to an ephemeral volume. This volume appends the container's name to the beginning. So even if you create a volume with the name `vol`, Docker makes it `container.vol`. It is impossible to create persistent volumes in the code, which I didn't know. Despite having the persistent volume listed in the config, it kept creating the ephemeral one on request. This is an obvious point of confusion. I understand the need to differentiate between ephemeral and persistent storage, but blindly appending the name and ignoring the configuration isn't the best approach. Why it's done this way is beyond me.

## Configuration Hell

This is one of the largest problems with containerization. Figuring out whether to put something in a configuration file at the Docker level or writing it into a script that will be copied into the container is an art that takes time to develop. At the moment, I'm not amazing, but I will develop over time. Also, I feel that I'm spending too much time editing configuration files instead of writing code. Using global variables is essential; hardcoding is not a great practice. However, when you have `config.yaml`, `.env`, `Dockerfile`, and `.config` files for your software, and you're copying over configs for `crontab` or other libraries, it becomes overwhelming knowing what goes where and why.

## Networking

I haven't worked with networking yet, but my friend has told me that inter-container communication can be challenging. In computing, everything is relative, and seeing `A` from the perspectives of `B`, `C`, `D`, and `A` can be confusing. Nomenclatures that have developed over the years can have different meanings depending on their location in containers. For instance, you might find client code on the server and server code on the client. `Localhost` is a relative term. Encountering these things and their many different contexts simultaneously, can feel like looking at spaghetti code. Often, I find myself staring through the monitor, trying to ponder how everything is interconnected.

## Classic: CR LF vs LF

_If there was one thing I could go back and change, it would be to smack the person who decided that a carriage return and a line feed should be used together. Like, I kind of get it that a carriage return is from typewriters; it moves your cursor to the next line, and the line feed moves the paper forward so it's actually on a new line. But, Microsoft's DOS wasn't ever used as an OS on typewriters, so why keep the style? Also, if it was exclusively one for linux and the other one for Windows, then it wouldn't be an issue because it would be obvious when viewing the text in the other format that, hey look, the text isn't wrapping around properly, so it must be using the inappropriate return character. The fact that Windows uses both and Linux uses the second one, makes it impossible to tell unless you're actually looking at the whitespace characters with a special mode._

Programming in an Alpine container on Windows isn't an ideal combination. Because I'm using Alpine to reduce my container size, it doesn't handle the end-of-line characters of Windows files like Ubuntu would in WSL. There were hours spent debugging code, only to discover that the issue was \r\n vs \n. This experience reinforced my desire to move from Windows to pure GNU/Linux for container development or at least always use an IDE.
