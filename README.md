# 🐝 Beenest Analytics Dashboard

[dashboard.beenest.io](http://dashboard.beenest.io)

## Configuration

This dashboard needs credentials to access [keen.io](https://keen.io) analytics.
Specifically, the Project ID and Read Key for each project (available from the 
"Access" tab of the keen.io user interface) must be recorded in a file named
`keen.json` in the following format:

    {
      "development": {
        "projectId": "...",
        "readKey": "..."
      },
      "staging": {
        "projectId": "...",
        "readKey": "..."
      },
      "production": {
        "projectId": "...",
        "readKey": "..."
      }
    }

## Development

The Beenest Analytics Dashboard just needs to be served over HTTP, e.g. with
[`http-server`](https://www.npmjs.com/package/http-server).

## Deployment

To deploy, upload contents of this repository along with `keen.json` to the 
similarly-named Amazon S3 bucket.
