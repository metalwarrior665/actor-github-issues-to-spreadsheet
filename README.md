# Github issues to spreadsheet

This is an [Apify](https://apify.com/) [actor](https://apify.com/actors) that collects all open issues from the repositories you provide it and uploads them to your spreadsheet.

## Authentication & authorization
The actor uses OAuth to allow you to authorize the changes to your spreadsheet. For more details, check the readme of **Google Sheets** ([lukaskrivka/google-sheets](https://apify.com/lukaskrivka/google-sheets)) actor which is used here under the hood.

## Issues formatting
Issues can be uploaded all into one sheet called `All issues` or each repository can be uploaded to a separate sheet. Both options can be true at the same time (then both `All issues` sheet and separate sheets are created). If the sheet doesn't exist, it is automatically created. The uploaded issues have these columns:
- `repository` (skipped in `oneSheetPerRepository`)
- `title`
- `label1`
- `label2`
- `author`
- `createdAt`
- `updatedAt`
- `comments`
- `url`

All uploaded issues overwrite the previously stored issues. So the content in the sheets always reflect the latest state of the issues. If you would like to get more columns, let me know in the issues of this actor :)

## Input
- `repositories` \<Array\<String\>\> From what repositories the issues will be collected.
- `spreadsheetId` \<String\> Id of the spreadsheet where you want to upload the issues.
- `oneSheetForAllRepositories` \<Boolean\> If true, each repository will be uploaded to a signle sheet named All issues. Can be used in combination with oneSheetPerRepository.
- `oneSheetPerRepository` \<Boolean\> If true, each repository will be uploaded to a sheet with the same name as the repository. Can be used in combination with oneSheetForAllRepositories.
- `googleOauthStore` \<String\> Key-value store where your Google OAuth tokens will be stored so you don't have to authorize every time again. By default it is `google-oauth-tokens`.

## Running locally and scheduling
This actor can be run locally but you still need to have an Apify account and be logged in your [apify-cli]() session. That is because this actor calls **Google Sheets** (lukaskrivka/google-sheets) actor on the Apify platform. If you really want to run this locally without the usage of Apify at all, you will have to clone the [Google Sheets repo](https://github.com/metalwarrior665/actor-google-sheets) and then merge the code together somehow with this one.

Usually, you would like to have this sheet up to date so I recommend using the [Apify scheduler](https://my.apify.com/schedules). You can set up any interval in the scheduler but it should not be more than once every hour so the Google and Github APIs are not overloaded.
