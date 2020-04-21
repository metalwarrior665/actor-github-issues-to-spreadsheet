const Apify = require('apify');

const githubCall = require('./github-call');

Apify.main(async () => {
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    const {
        spreadsheetId,
        repositories = [],
        googleOauthStore,
        oneSheetPerRepository = false,
    } = input;

    const allIssues = [];
    for (const repository of repositories) {
        if (!repository.split('/').length === 2) {
            throw new Error(`Repository ${repository} has wrong format! It needs to be "username/repository"`);
        }
        const data = await githubCall(repository);
        const issues = data.map((issue) => ({
            '0_repository': repository,
            '1_title': issue.title,
            '2_label1': issue.labels[1] ? issue.labels[1].name : null,
            '3_label2': issue.labels[2] ? issue.labels[2].name : null,
            '4_author': issue.user.login,
            '5_createdAt': issue.created_at,
            '6_updatedAt': issue.updated_at,
            '7_comments': issue.comments,
            '8_url': issue.html_url,
        }));
        if (oneSheetPerRepository) {
            allIssues.push({ repository, issues });
        } else {
            allIssues.push(...issues);
        }
        await Apify.utils.sleep(1000);
    }

    console.warn(`AUTHORIZATION REQUIRED --- For the first run, you will need to authorize
            Go to https://my.apify.com, click on the lukaskrivka/google-sheets run, list the latest run and authorize in the Live View tab`);
    if (oneSheetPerRepository) {
        for (const { repository, issues } of allIssues) {
            const spreadsheetInput = {
                spreadsheetId,
                mode: 'replace',
                rawData: issues,
                tokensStore: googleOauthStore,
                range: repository,
            };
            console.log('Uploading data to a sheet');

            await Apify.call('lukaskrivka/google-sheets', spreadsheetInput);
            console.log('Data uploaded');
        }
    } else {
        const spreadsheetInput = {
            spreadsheetId,
            mode: 'replace',
            rawData: allIssues,
            tokensStore: googleOauthStore,
        };
        console.log('Uploading data to a sheet');
        await Apify.call('lukaskrivka/google-sheets', spreadsheetInput);
        console.log('Data uploaded');
    }
});
