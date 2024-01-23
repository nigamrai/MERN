import express from 'express';
import courseController from '../controllers/course.controller';

import upload from '../middlewares/multer.middleware';
import { authorizedRoles, isLoggedIn } from '../middlewares/auth.middleware';
const router=express.Router();
router.route('/')
    .post(isLoggedIn,upload.single('thumbnail'),courseController.createCourse)
    .get(courseController.getAllCourses)
    .delete(isLoggedIn,courseController.removeLectureFromCourse)
router.route('/:id')
        .get(isLoggedIn,courseController.getLecturesByCourseId)
        .put(isLoggedIn,courseController.updateCourse)
        .delete(isLoggedIn,courseController.deleteCourse)
        .post(isLoggedIn,upload.single('lecture'),courseController.addLectureToCourseById);
export default router;  