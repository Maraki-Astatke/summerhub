import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { checkoutLimiter, postProducts, getProducts, getProductsId, putProductsId, deleteProductsId, getCart, postCartAdd, putCartUpdate, deleteCartRemoveProductId, postOrdersCreate, getOrders, getOrdersId, postProductsIdReview, getProductcategories } from "../controllers/marketplaceController.js";
const router = Router();
router.post('/products', authenticateToken, requireRole(['seller', 'admin']), [
    body('name').notEmpty().isLength({ min: 3, max: 200 }).trim().escape(),
    body('description').optional().isLength({ max: 2000 }).trim().escape(),
    body('price').isFloat({ min: 0.01 }),
    body('stockCount').isInt({ min: 0 }),
    body('categoryId').optional().isInt(),
    body('imageUrl').optional().isString(),
    body('phone').optional().isString()
], postProducts);
router.get('/products', [
    query('categoryId').optional().isInt(),
    query('search').optional().isString(),
    query('minPrice').optional().isFloat(),
    query('maxPrice').optional().isFloat(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
], getProducts);
router.get('/products/:id', [param('id').isInt()], getProductsId);
router.put('/products/:id', authenticateToken, requireRole(['seller', 'admin']), [param('id').isInt()], putProductsId);
router.delete('/products/:id', authenticateToken, requireRole(['seller', 'admin']), [param('id').isInt()], deleteProductsId);
router.get('/cart', authenticateToken, requireRole(['student', 'teacher', 'parent', 'scholar']), getCart);
router.post('/cart/add', authenticateToken, requireRole(['student', 'teacher', 'parent', 'scholar']), [
    body('productId').isInt(),
    body('quantity').isInt({ min: 1 })
], postCartAdd);
router.put('/cart/update', authenticateToken, requireRole(['student', 'teacher', 'parent', 'scholar']), [
    body('productId').isInt(),
    body('quantity').isInt({ min: 0 })
], putCartUpdate);
router.delete('/cart/remove/:productId', authenticateToken, requireRole(['student', 'teacher', 'parent', 'scholar']), [param('productId').isInt()], deleteCartRemoveProductId);
router.post('/orders/create', authenticateToken, requireRole(['student', 'teacher', 'parent', 'scholar']), checkoutLimiter, postOrdersCreate);
router.get('/orders', authenticateToken, getOrders);
router.get('/orders/:id', authenticateToken, [param('id').isInt()], getOrdersId);
router.post('/products/:id/review', authenticateToken, requireRole(['student', 'teacher', 'parent', 'scholar']), [
    param('id').isInt(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isLength({ max: 500 }).trim().escape()
], postProductsIdReview);
router.get('/product-categories', getProductcategories);
export default router;
