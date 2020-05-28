# LinkedIn Customer Discovery
What this does:
- Logs in and navigates to a specified LinkedIn Search
- Retrieves the first name, last name, and profile link of all the search results
- Hits LinkedIn's API to make a connection for every profile (does this asynchronously).

### How to use:
- Currently, the only way to run this is probably just cloning the directory and running it locally:
```
cd linkedin-bot
npm install
npm start
```
We briefly tried to make installers, but we've never done Electron apps and it seemed like too much work so we never got around to it.

For the LinkedIn search URL, this is what we would do:
1. Navigate to a LinkedIn search page and add multiple companies to the filters
2. Type in a job title or keyword into the title field.

If there are any problems, feel free to reach out or create a GitHub issue and I'll try to get around to it.
