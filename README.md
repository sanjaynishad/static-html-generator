# static-html-generator
This is a static site boilerplate using gulp and handlebars to generate static HTML files. This is using `gulp` for build and dev automation, and `handlbar` for the template engine.
You can just copy your HTML template into the `www` folder and generate ready to deploy a static website, with minify and combine JS/CSS.

## Instructions
- `git clone https://github.com/sanjaynishad/static-html-generator.git` or [download](https://github.com/sanjaynishad/static-html-generator/archive/refs/heads/master.zip)
- `npm install` to install the dependencies
- `npm start` to start developing on the local machine
- `npm run build` to build the project for production
- `npm run deploy` to deploy the production build (`dist` folder)

## Configs
- `partials` - partial folder to be used for `gulp-compile-handlebars`
- `hbs` - context data as per pages, keys must match the `<name>.hbs` file's name
- `ftp` - FTP login info to deploy the static site

`./www/config.json`

```
{
    "partials": "./partials",
    "hbs": {
        "index": {
            "title": "This is home page.",
            "description": "This is another data to be passed in handlebar template and added to meta tag, check head.hbs"
        },
        "page1": {},
        "page2": {}
    },
    "ftp": {
        "host": "example.com",
        "user": "user",
        "password": "password",
        "folder": "/public_html"
    }
}
```

## Not fulfilling all requirements? Need to add more functionality?
- For the templating syntax [Handlebars](https://handlebarsjs.com/)
- For the [Gulp](https://gulpjs.com/)

## Contribution
You are most welcome to add more functionality here. Thanks.
