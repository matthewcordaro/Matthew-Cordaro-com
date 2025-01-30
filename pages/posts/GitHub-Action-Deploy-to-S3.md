---
title: "GitHub Actions: Deploy to S3"
date: 2025/1/29
description: When the main branch is updated, github will deploy to S3
tag: AWS, pnpm, GitHub, 
author: Matthew Cordaro
---

Setting up a GitHub Action workflow that deploys a site to an S3 bucket whenever there's a change to the main branch.

When using this guide it will deploy with HTTP.  S3 doesn't support HTTPS outright.  For that you will need Cloud Front. See AWS documentation for details on getting that working. 

---

## S3 Bucket Creation
1) Go to S3 and Create a bucket.
2) Give the bucked a name.
3) Uncheck block all public access as we intend to host the site there; we want the public to access it.
4) Versioning is unnecessary as we have our code in GitHub, but you can turn on for an easy restore in emergency.
5) Click create bucket.

## IAM Policy & User
Create an AWS IAM user that has full access permissions to your S3 bucket.
1) Go to the AWS Management Console.
2) Navigate to IAM (Identity and Access Management).
3) Create a new JSON policy for access to the S3 bucket you will be using. Be sure to replace `S3_BUCKET_NAME` with the name of the bucket.
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:ListBucket"
                ],
                "Resource": [
                    "arn:aws:s3:::S3_BUCKET_NAME"
                ]
            },
            {
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:DeleteObject"
                ],
                "Resource": [
                    "arn:aws:s3:::S3_BUCKET_NAME/*"
                ]
            }
        ]
    }
    ```
   _This policy grants the ability, to view all the contents of, and to apply CRUD operations to the root of, the bucket._
4) Give it a name and a description. a new user with programmatic access.
5) Now let's create a IAM User by going back to IAM and selecting Users.
6) Create a User and give it a proper name like `GitHub-BUCKET_NAME-S3`.
7) Attached the customer managed policy we just created to the user we just created.
8) Click on the user we just created and select "Security Credentials".
9) Create access key for "Third-party-service".  Don't listen to any of their warning, this is totally safe. I promise. ;) 
    _There are steps you can take in emergency like revoking the IAM keys, deleting the IAM user, or the IAM policy and also on the GitHub Site_
10) Note the `AWS Access Key ID` and `Secret Access Key` for the next steps in GitHub. The bucket's name and region will be needed too. If the keys are forgotten, they will need to be deleted recreated.


## GitHub Secrets
We need to store the above information in GitHub Secrets so that it's secure.
1) Go to your GitHub repository.
2) Navigate to Settings -> Secrets and variables -> Actions.
3) Create new repository secrets / variables with the following key value pairs:

    Secret `AWS_ACCESS_KEY_ID`: AWS Access Key ID.

    Secret `AWS_SECRET_ACCESS_KEY`: AWS Secret Access Key.

    Variable `AWS_REGION`: The region where the S3 bucket is located (e.g., us-east-1).

    Variable `S3_BUCKET_NAME`: The name of the S3 bucket.


## Final Steps 
1) Create a GitHub Actions workflow file `.github/workflows/deploy.yml` in your repository with the following 
   in it.
    ```yaml
    name: Deploy to S3
    
    on:
      push:
        branches: ["main"]
      pull_request:
        branches: ["main"]
    
    jobs:
      build-and-deploy:
        runs-on: ubuntu-latest
    
        steps:
          - name: Checkout code
            uses: actions/checkout@v2

          - name: Install pnpm
            uses: pnpm/action-setup@v4
            with:
              version: 10
    
          - name: Install dependencies
            run: pnpm install
    
          - name: Build project
            run: pnpm build
    
          - name: Sync S3 bucket
            env:
              AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
              AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
              AWS_REGION: ${{ vars.AWS_REGION }}
              S3_BUCKET_NAME: ${{ vars.S3_BUCKET_NAME }}
            run: aws s3 sync out $S3_BUCKET_NAME --delete
    ```
    _This workflow does the following in order..._

    1) Triggers on a push to the main branch.
    2) Starts up an ubuntu instance to run the following steps on.
    3) Checks out your repository code.
    4) Installs pnpm
    5) Installs dependencies then builds the Next.js site using pnpm.
    6) Syncs the contents of the `out` folder to the specified S3 bucket, while deleting any old files that are not in the `out` folder.
2) Push up your changes to main to trigger the first workflow.
3) Go back to the bucket > Properties, scroll to the bottom and enable the static website hosting. When doing so, set up the index and error (404) page the bucket should point to.

## Checkout your Bucket's URL 
It should all be working.  Checkout your bucket's URL. Try pushing some update and wait a min for deploy to happen.

There will most certainly be an error or two to resolve with changes to JS, AWS, and workflow tooling, but this guide should get you about 95% of the way there.
