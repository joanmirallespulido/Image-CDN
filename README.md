Image CDN 

Image CDN is a simple image CDN service that allows you to upload images and get a URL to access them. It is built using Node.js, Express, Multer and Jimp.

## Features

- Upload Single or Multiple images in one call
- Get image URL
- Resize image
- Crop image
- Composite image
- Blur image
- Rotate image

- You can save an image in as many size sizes as wanted, by default the image is saved in the following sizes with the following prefixes:
    - thumbnail: 100x100
    - small: 300x300
    - medium: 600x600
    - large: 1200x1200

    If width or height is not specified for these sizes the previous listed sizes will be used. Otherwise the image will be resized to the specified width and height with the prefix of the size passed. 

    If an image with a specific prefix already exists it will return the URL and not resize the image.

    If a size needs to be resized for a specific prefix you can pass the new height and width with the prop {force : true}.  

## Installation
    
    ```bash
    $ git clone
    $ cd image-cdn
    $ npm install
    $ npm start
    ```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT`

## API


```http
POST /images 
POST /images/images
GET /images?path
POST /images/edit
POST /images/edit/compose
DELETE /images?path
```


