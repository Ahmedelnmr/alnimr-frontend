# Alnimr Real Estate: Frontend

The Arabic (RTL) front-end for **النمر للعقارات**, a luxury real-estate showcase. It pairs with the [realestate-api](https://github.com/Ahmedelnmr/realestate-api) Laravel back end.

## Features

- **Public site**: home page with hero video and search, companies list and detail, projects list and detail.
- **Admin dashboard**: login, companies, projects, units and media management.
- Image uploads through Cloudinary.
- No build step: plain HTML, CSS and JavaScript modules.

## Structure

```
index.html
pages/            public pages (companies, projects, details)
pages/dashboard/  admin pages (login, companies, projects, units, media)
pages-js/         page scripts
components/       shared dashboard layout
css/              main.css, dashboard.css
```

## Configuration

`index.html` holds an `APP_CONFIG` object. Set your own values:

```js
window.APP_CONFIG = {
  API_URL: 'http://localhost:8000/api/v1',
  CLOUDINARY_CLOUD_NAME: 'your-cloud-name',
  CLOUDINARY_UPLOAD_PRESET: 'your-upload-preset',
};
```

## Run locally

Start the API from [realestate-api](https://github.com/Ahmedelnmr/realestate-api), then serve this folder with any static server, for example:

```bash
npx serve .
```

## Author

Ahmed Elnmr, https://github.com/Ahmedelnmr
