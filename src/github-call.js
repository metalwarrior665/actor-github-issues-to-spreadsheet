const Apify = require('apify');

const githubCall = async (repository, retries = 0) => {
    if (retries > 6) {
        throw new Error(`Too many retries - ${retries}. Please contact the author of this actor.`);
    }
    const url = `https://api.github.com/repos/${repository}/issues`
    const { body, statusCode } = await Apify.utils.requestAsBrowser({
        url,
        json: true,
    });

    if (statusCode === 200) {
        console.log(`Got 200 response for ${url}`);
        return body;
    }
    if (statusCode >= 500 || statusCode === 429) {
        console.warn(`Got ${statusCode} response for ${url}, retry n. ${retries}, retrying in ${2 ** (retries)} seconds`);
        await githubCall(repository, retries + 1);
    } else {
        throw new Error(`Got ${statusCode} response. Something went really wrong! Please contact the author of this actor.`);
    }
}

module.exports = githubCall;
