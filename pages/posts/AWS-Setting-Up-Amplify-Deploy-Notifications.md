---
title: "AWS: Setting up Amplify Deployment Notifications via SNS"
date: 2025/2/10
description: How to Set Up Email Notifications for AWS Amplify Deployments Using Amazon SNS
tag: AWS, Amplify, SNS 
author: Matthew Cordaro
---

# AWS: Setting up Amplify Deployment Notifications via SNS

_How to Set Up Email Notifications for AWS Amplify Deployments Using Amazon SNS_

AWS Amplify simplifies the process of building, deploying, and hosting web applications. But wouldn’t it be great if you could get real-time email notifications for successful or failed deployments? In this guide, we’ll show you how to integrate Amazon Simple Notification Service (SNS) with Amplify to receive email alerts—while keeping sensitive data, like your SNS topic ARN, secure by using environment variables.

## Create an SNS Topic

Start by creating an Amazon SNS topic that will send deployment notifications.

1. Go to the Amazon SNS Console
2. Click Create topic and choose _Standard_ as the type
3. Give your topic a _Name_, like `AmplifyDeploymentNotifications`
4. Click _Create topic_
5. Note the _ARN_, you will need it for later.

## Subscribe Your Email Address

To receive notifications, you need to subscribe your email address to the SNS topic.

1. Navigate to your SNS Topic in the console
2. Click _Create_ subscription
3. Set the _Protocol_ to Email
4. Under _Endpoint_ enter your email address
5. Click _Create subscription_
6. Click the provided link, in the confirmation email that was sent, to confirm the subscription

## Add / Modify IAM Role for Amplify
1. Create a role if necessary
2. Add default
3. incluce an inline policy for SNS allow Publish
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "sns:Publish",
                "Resource": "arn:aws:sns:your-region:your-account-id:AmplifyDeploymentNotifications"
            }
        ]
    }
    ```
4. Click _Next_
5. 

## Add an SNS Topic ARN Environment Variable to Amplify

To prevent sensitive information, like your SNS topic ARN, from appearing in your source code on GitHub, store it as an environment variable in Amplify.

1. Navigate to your Amplify app in the AWS Amplify Console
2. In the menu, go to _Hosting > Environment_ variables
3. Click _Manage variables_
4. Click _Add new_
5. Set the _Variable_ to `SNS_TOPIC_ARN` and _Value_ to the ARN of your SNS topic
6. Click _Save_ the environment variable.

## Create a `post-deploy` Hook in Amplify

AWS Amplify supports lifecycle hooks that run custom scripts after deployments. Use the post-deploy hook to publish messages to your SNS topic.

1. Create and navigate to the `amplify/hooks` folder in your project.
2. Create or update the `post-deploy.js` file with the following code:

    ```javascript
    const AWS = require('aws-sdk');
    const sns = new AWS.SNS();
    
    const run = async () => {
    const topicArn = process.env.SNS_TOPIC_ARN;
    const branchName = process.env.GIT_BRANCH;
    const buildStatus = process.env.AWS_AMPLIFY_BUILD_STATUS;
    const buildLogs = process.env.AWS_AMPLIFY_BUILD_LOGS;
    const notificationBranches = ['main', 'dev'];
    
        const logInfo = {
            timestamp: new Date().toISOString(),
            topicArn,
            branchName,
            buildStatus,
            isNotificationBranch: notificationBranches.includes(branchName)
        };
    
        if (notificationBranches.includes(branchName)) {
            let message;
            if (buildStatus === 'SUCCEED') {
                message = `✅ Successful deployment to ${branchName}!\n` +
                    `🚀 The build and deployment completed successfully.`;
            } else if (buildStatus === 'FAILED') {
                message = `❌ Failed deployment to ${branchName}!\n` +
                    `⚠️ The build or deployment encountered issues.\n\n` +
                    `Build Logs:\n${buildLogs || 'No logs available'}`;
            } else {
                console.log(JSON.stringify({
                    ...logInfo,
                    event: 'skip_notification',
                    reason: 'build_in_progress'
                }, null, 2));
                return;
            }
    
            const params = {
                Message: message,
                TopicArn: topicArn
            };
    
            try {
                await sns.publish(params).promise();
                console.log(JSON.stringify({
                    ...logInfo,
                    event: 'notification_sent',
                    message,
                    status: 'success'
                }, null, 2));
            } catch (error) {
                console.error(JSON.stringify({
                    ...logInfo,
                    event: 'notification_error',
                    error: {
                        message: error.message,
                        code: error.code,
                        statusCode: error.statusCode
                    },
                    status: 'error'
                }, null, 2));
            }
        } else {
            console.log(JSON.stringify({
                ...logInfo,
                event: 'skip_notification',
                reason: 'non_notification_branch'
            }, null, 2));
        }
    };
    
    run();
    ```
   
3. Note `const notificationBranches = ['main', 'dev'];`  Feel free to change this to the branches you want to get 
   deploy notifications for.
4. Make sure to update your `dependencies` in `package.json` to include latest `aws-sdk`.
5. Commit and push your changes to the branch you want to deploy.

## Test

Amplify should now be executing the `post-deploy.js` script after any deployment is complete. Check your email inbox for notifications when deploying the set branches. If you don't receive an email, double-check the SNS topic subscription, the SNS_TOPIC_ARN environment variable, and the script for any errors.

### Auto unsubscribe issue

If you're running into gmail's spam filter automatically unsubscribing you, you should enable authentication to
unsubscribe. [See this AWS Post on how to do this.](https://repost.aws/knowledge-center/prevent-unsubscribe-all-sns-topic)