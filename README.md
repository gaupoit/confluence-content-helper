
# Confluence-content-helper

This is a cool tool to download confluence's content. Parsing them to markdown files and storing them to structure like in Confluence's page.

## Getting Started
1. Install confluence-content-helper via npm: 
```bash

$ npm install confluence-content-helper
```

2. Configuration 

Before using this package, we need to edit some configrations inside /config/confluenceConfig.js file.

| Param | Type | Describe |
| --- | --- | --- |
| baseUrl | string| the base url of your Confluence |
| baseUri | string | the base Restful api of your Confluence |
| dataPath | string | where to store markdown files |
| username | string | the confluence's user name |
| password | string | the confluence's user password |
| publicDir | string | where to store assert files |
| imagePath | string | where to store image files, relatively to public's directory |


3. Let's start

```bash

$ ./node_modules/confluence-content-helper/bin/confluence --title="Input your space or page in Confluence here"

```

## License

  [ISC](LICENSE)






