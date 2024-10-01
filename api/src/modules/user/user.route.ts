import expres from 'express';
import { userController } from './user.boostrap';

const router = expres.Router();

router.route('/').get(userController.getAll);
router.route('/').post(userController.create);
router.route('/:id').put(userController.update);
router.route('/:id').get(userController.get);
router.route('/:id').delete(userController.delete);

export default router;
