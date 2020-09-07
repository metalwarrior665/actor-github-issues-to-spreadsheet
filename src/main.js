const Apify = require('apify');

const githubCall = require('./github-call');
const utils = require('./utils');

Apify.main(async () => {
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    const {
        spreadsheetId,
        repositories = [],
        googleOauthStore,
        oneSheetForAllRepositories = true,
        oneSheetPerRepository = false,
    } = input;

    if (!oneSheetForAllRepositories && !oneSheetPerRepository) {
        throw new Error('WRONG INPUT! You need to pick at least one of oneSheetForAllRepositories and oneSheetPerRepository or both');
    }

    const issuesPerRepository = [];
    const allIssues = [];
    for (const repository of repositories) {
        if (!repository.split('/').length === 2) {
            throw new Error(`Repository ${repository} has wrong format! It needs to be "username/repository"`);
        }
        const data = await githubCall(repository);
        if (!data || data.length === 0) {
            console.warn(`Repository ${repository} did not return any open issues. Skipping...`);
            continue;
        }
        const issues = data.map((issue) => ({
            repository,
            title: issue.title,
            label1: issue.labels[1] ? issue.labels[1].name : null,
            label2: issue.labels[2] ? issue.labels[2].name : null,
            author: issue.user.login,
            createdAt: issue.created_at,
            updatedAt: issue.updated_at,
            comments: issue.comments,
            url: issue.html_url,
        }));
        if (oneSheetPerRepository) {
            issuesPerRepository.push({ repository, issues: issues.map((issue) => ({ ...issue, repository: undefined })) });
        }
        if (oneSheetForAllRepositories) {
            allIssues.push(...issues);
        }
        await Apify.utils.sleep(1000);
    }

    console.warn(`AUTHORIZATION REQUIRED --- For the first run, you will need to authorize
            Go to https://my.apify.com, click on the lukaskrivka/google-sheets run, list the latest run and authorize in the Live View tab`);

    for (const { repository, issues } of issuesPerRepository) {
        const spreadsheetInput = {
            spreadsheetId,
            mode: 'replace',
            rawData: issues,
            tokensStore: googleOauthStore,
            range: repository,
            columnsOrder: utils.getColumnsOrder(true),
        };
        console.log('Uploading data to a sheet');

        await Apify.call('lukaskrivka/google-sheets', spreadsheetInput);
        console.log('Data uploaded');
    }

    if (allIssues.length > 0) {
        const spreadsheetInput = {
            range: 'All issues',
            spreadsheetId,
            mode: 'replace',
            rawData: allIssues,
            tokensStore: googleOauthStore,
            columnsOrder: utils.getColumnsOrder(false),
        };
        console.log('Uploading data to a sheet');
        await Apify.call('lukaskrivka/google-sheets', spreadsheetInput);
        console.log('Data uploaded');
    }
});
