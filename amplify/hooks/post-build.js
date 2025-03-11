const AWS = require('aws-sdk');
const sns = new AWS.SNS();

const run = async () => {
    const topicArn = process.env.SNS_TOPIC_ARN;
    const branchName = process.env.GIT_BRANCH;
    const buildStatus = process.env.AWS_AMPLIFY_BUILD_STATUS;
    const buildLogs = process.env.AWS_AMPLIFY_BUILD_LOGS; // Add this line to get build logs
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
            message = `✅ Successful build of ${branchName}!\n` +
                `🚀 The build completed successfully. Deploying now.`;
        } else if (buildStatus === 'FAILED') {
            message = `❌ Failed build of ${branchName}!\n` +
                `⚠️ The build encountered issues.\n\n` +
                `Build Logs:\n${buildLogs || 'No logs available'}`;  // Include logs in failure message
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