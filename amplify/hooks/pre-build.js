const AWS = require('aws-sdk');
const sns = new AWS.SNS();

const run = async () => {
    const topicArn = process.env.SNS_TOPIC_ARN;
    const branchName = process.env.GIT_BRANCH;
    const buildStatus = process.env.AWS_AMPLIFY_BUILD_STATUS;
    const notificationBranches = ['main', 'dev'];

    const logInfo = {
        timestamp: new Date().toISOString(),
        topicArn,
        branchName,
        buildStatus,
        isNotificationBranch: notificationBranches.includes(branchName)
    };
    const message = "Building " + branchName + "...";

    if (notificationBranches.includes(branchName)) {
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