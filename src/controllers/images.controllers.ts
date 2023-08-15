import { Request, Response } from "express";
import Jimp from "jimp";
import path from "path";
import fs from "fs";

const default_sizes = [
    { prefix: 'thumbnail', width: 100, height: 100 },
    { prefix: 'small', width: 300, height: 300 },
    { prefix: 'medium', width: 600, height: 600 },
    { prefix: 'large', width: 1200, height: 1200 },
];


const resizeImage = async (image: any, width: number, height: number) => {
    return await image.clone().resize(width, height);
};

export const uploadImage = async (req: Request, res: Response) => {
    try {
        try {
            let sizes: any = JSON.parse(req.body.sizes);
            console.log('sizes', sizes)
            if (!sizes) sizes = default_sizes;

            if (!req.file) {
                return res.status(400).send('No image file uploaded.');
            }

            const originalImageBuffer = req.file.buffer;

            // Create a Jimp image from the uploaded buffer
            const image: Jimp = await Jimp.read(originalImageBuffer);

            // Resize the image to different sizes


            const resizedImages = await Promise.all(
                sizes.map(async (size: any) => {
                    // check if image exists
                    const imagePath = path.join(__dirname, 'uploads', `${req.file!.originalname}`, `${size.prefix}_${req.file!.originalname}`);
                    if (fs.existsSync(imagePath) && !size.force) {
                        return { size: size.prefix, path: imagePath };
                    }
                    console.log('it does not exist')
                    const resizedImage = await resizeImage(image, size.width || default_sizes.filter((item: any) => item.prefix === size.prefix)[0].width, size.height || default_sizes.filter((item: any) => item.prefix === size.prefix)[0].width);
                    await resizedImage.writeAsync(imagePath);
                    return { size: size.prefix, path: imagePath };
                })
            );

            // Save the original image to a temporary directory (optional)
            const originalImagePath = path.join(__dirname, 'uploads', `${req.file.originalname}`, `original_${req.file.originalname}`);
            await image.writeAsync(originalImagePath);

            // Return the location (URL) of the original image and resized images
            const originalImageUrl = `/uploads/${req.file.originalname}/original_${req.file.originalname}`;
            const resizedImageUrls = resizedImages.map((item) => ({
                size: item.size,
                url: `/uploads/${req.file!.originalname}/${path.basename(item.path)}`,
            }));

            res.status(200).json({ originalImage: originalImageUrl, resizedImages: resizedImageUrls });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('An error occurred.');
        }


    } catch (error: any) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
}


export const uploadImages = async (req: Request, res: Response) => {
    try {
        console.log('here')

        if (!req.files) {
            return res.status(400).send('No image file uploaded.');
        }

        const images: any = req.files as Express.Multer.File[];

        const productName = req.query.productName;

        if (!productName) return res.status(400).send('No product name provided.');


        const imagesUrls = await Promise.all(
            images.map(async (image: any) => {

                // check if image exists
                const img: Jimp = await Jimp.read(image.buffer);
                const imagePath = path.join(__dirname, 'uploads', `${productName}`, `${image.originalname}`);
                if (fs.existsSync(imagePath)) {
                    return { path: imagePath };
                }
                console.log('it does not exist')

                await img.writeAsync(imagePath);

                return { path: imagePath };
            })
        );

        return res.status(200).json({ imagesUrls });

    } catch (error: any) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
}


export const getImage = async (req: Request, res: Response) => {
    try {
        const filePath = path.join(__dirname, req.query.path as string);
        //         console.log('filePath', filePath)
        if (!filePath) {
            return res.status(400).send('No image file uploaded.');
        }

        const image = await Jimp.read(filePath as string);

        const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': buffer.length,
        });

        res.end(buffer);


    } catch (error: any) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
}

export const editImage = async (req: Request, res: Response) => {
    try {
        console.log('req.file', req.file)
        if (!req.file) {

            return res.status(400).send('No image file uploaded.');
        }

        const mode = req.query.mode as string;

        if (!mode) return res.status(400).send('No mode specified.');

        const originalImageBuffer = req.file.buffer;

        // Create a Jimp image from the uploaded buffer
        const image: Jimp = await Jimp.read(originalImageBuffer);

        switch (mode) {
            case 'crop':

                const cropX = Number(req.query.x);
                const cropY = Number(req.query.y);
                const cropWidth = Number(req.query.w);
                const cropHeight = Number(req.query.h);



                const buffer = await image.crop(cropX, cropY, cropWidth, cropHeight).getBufferAsync(Jimp.MIME_JPEG);

                res.writeHead(200, {
                    'Content-Type': 'image/jpeg',
                    'Content-Length': buffer.length,
                });

                res.end(buffer);
                break;
            case 'rotate':
                const degree = Number(req.query.degree);

                const buffer2 = await image.rotate(degree).getBufferAsync(Jimp.MIME_JPEG);

                res.writeHead(200, {
                    'Content-Type': 'image/jpeg',
                    'Content-Length': buffer2.length,
                });

                res.end(buffer2);

                break;


            case 'resize':

                const width = Number(req.query.w);
                const height = Number(req.query.h);

                const buffer3 = await image.resize(width, height).getBufferAsync(Jimp.MIME_JPEG);

                res.writeHead(200, {
                    'Content-Type': 'image/jpeg',
                    'Content-Length': buffer3.length,
                });

                res.end(buffer3);

                break;

            case 'blur':
                const blur = req.query.blur as string;

                const buffer4 = await image.blur(parseInt(blur)).getBufferAsync(Jimp.MIME_JPEG);

                res.writeHead(200, {
                    'Content-Type': 'image/jpeg',
                    'Content-Length': buffer4.length,
                });

                res.end(buffer4);

                break;

            default:
                break;

        }

    } catch (error: any) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
}

export const composeImage = async (req: Request, res: Response) => {
    try {

        if (!req.files) {
            return res.status(400).send('No image file uploaded.');
        }

        const images = req.files as Express.Multer.File[];


        let mainImage = await Jimp.read(images[0].buffer);
        let secImage = await Jimp.read(images[1].buffer);


        console.log('mainImage', mainImage)
        console.log('secImage', secImage)
        const x = Number(req.query.x);
        const y = Number(req.query.y);

        const buffer1 = await secImage.resize(100, 100).getBufferAsync(Jimp.MIME_JPEG);

        // buffer to jimp

        const buffer2 = await Jimp.read(buffer1);

        const buffer = await mainImage.composite(buffer2, x, y).getBufferAsync(Jimp.MIME_JPEG);

        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': buffer.length,
        });

        res.end(buffer);



    } catch (error: any) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
}

export const deleteImage = async (req: Request, res: Response) => {

    try {
        const filePath = path.join(__dirname, req.query.path as string);
        //         console.log('filePath', filePath)
        if (!filePath) {
            return res.status(400).send('No image file uploaded.');
        }

        fs.unlinkSync(filePath);

        res.status(200).json({ message: 'Image deleted.' });

    } catch (error: any) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
}