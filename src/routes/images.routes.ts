

import { Router } from 'express';
import { composeImage, deleteImage, editImage, getImage, uploadImage, uploadImages } from '../controllers/images.controllers';

import multer from 'multer';

const router = Router();

// Set up multer to handle file uploads
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

router.route('/')
    .post(upload.single('image'), uploadImage);

router.route('/images')
    .post(upload.array('images'), uploadImages);

router.route('/')
    .get(getImage)

router.route('/edit')
    .post(upload.single('image'), editImage);

router.route('/edit/compose')
    .post(upload.array('images'), composeImage);

router.route('/')
    .delete(deleteImage)


export default router;