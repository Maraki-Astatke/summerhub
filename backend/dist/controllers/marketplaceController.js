import { validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import prisma from "../lib/prisma.js";
export const checkoutLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many checkout attempts. Try again later.' }
});
export const postProducts = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, description, price, stockCount, categoryId, imageUrl, phone } = req.body;
    const sellerId = req.user.userId;
    const product = await prisma.product.create({
        data: {
            name,
            description,
            price,
            stockCount,
            categoryId: categoryId ? parseInt(categoryId) : null,
            imageUrl,
            phone: phone || null,
            sellerId
        },
        include: {
            category: true,
            seller: {
                include: {
                    profile: true
                }
            }
        }
    });
    res.status(201).json(product);
};
export const getProducts = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { categoryId, search, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const where = {
        stockCount: { gt: 0 },
        isActive: true
    };
    if (categoryId)
        where.categoryId = parseInt(categoryId);
    if (search)
        where.name = { contains: search, mode: 'insensitive' };
    if (minPrice)
        where.price = { gte: parseFloat(minPrice) };
    if (maxPrice)
        where.price = { ...where.price, lte: parseFloat(maxPrice) };
    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: true,
                seller: {
                    include: {
                        profile: true
                    }
                },
                reviews: {
                    include: {
                        user: {
                            include: {
                                profile: true
                            }
                        }
                    }
                }
            },
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.product.count({ where })
    ]);
    res.json({
        data: products,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    });
};
export const getProductsId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const product = await prisma.product.findFirst({
        where: {
            id: parseInt(id),
            stockCount: { gt: 0 },
            isActive: true
        },
        include: {
            category: true,
            seller: {
                include: {
                    profile: true
                }
            },
            reviews: {
                include: {
                    user: {
                        include: {
                            profile: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    if (!product) {
        return res.status(404).json({ error: 'Product not found or out of stock' });
    }
    res.json(product);
};
export const putProductsId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { name, description, price, stockCount, categoryId, imageUrl, phone } = req.body;
    const userId = req.user.userId;
    const existingProduct = await prisma.product.findFirst({
        where: { id: parseInt(id), isActive: true }
    });
    if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: { include: { role: true } } }
    });
    const isAdmin = user?.roles.some(r => r.role.name === 'admin');
    if (!isAdmin && existingProduct.sellerId !== userId) {
        return res.status(403).json({ error: 'You can only edit your own products' });
    }
    const updateData = {};
    if (name)
        updateData.name = name;
    if (description !== undefined)
        updateData.description = description;
    if (price)
        updateData.price = price;
    if (stockCount !== undefined)
        updateData.stockCount = stockCount;
    if (categoryId)
        updateData.categoryId = categoryId ? parseInt(categoryId) : null;
    if (imageUrl !== undefined)
        updateData.imageUrl = imageUrl;
    if (phone !== undefined)
        updateData.phone = phone;
    const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: { category: true, seller: { include: { profile: true } } }
    });
    res.json(product);
};
export const deleteProductsId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const userId = req.user.userId;
    const existingProduct = await prisma.product.findFirst({
        where: { id: parseInt(id), isActive: true }
    });
    if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: { include: { role: true } } }
    });
    const isAdmin = user?.roles.some(r => r.role.name === 'admin');
    if (!isAdmin && existingProduct.sellerId !== userId) {
        return res.status(403).json({ error: 'You can only delete your own products' });
    }
    await prisma.product.update({
        where: { id: parseInt(id) },
        data: { isActive: false }
    });
    await prisma.cartItem.deleteMany({
        where: { productId: parseInt(id) }
    });
    await prisma.productReview.deleteMany({
        where: { productId: parseInt(id) }
    });
    res.status(204).send();
};
export const getCart = async (req, res) => {
    const userId = req.user.userId;
    const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
            product: {
                include: {
                    seller: {
                        include: {
                            profile: true
                        }
                    }
                }
            }
        }
    });
    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    res.json({
        items: cartItems,
        total,
        itemCount: cartItems.length
    });
};
export const postCartAdd = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { productId, quantity } = req.body;
    const userId = req.user.userId;
    const product = await prisma.product.findUnique({
        where: { id: productId }
    });
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    if (product.stockCount < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
    }
    const cartItem = await prisma.cartItem.upsert({
        where: {
            userId_productId: {
                userId,
                productId
            }
        },
        update: {
            quantity: { increment: quantity }
        },
        create: {
            userId,
            productId,
            quantity
        },
        include: {
            product: true
        }
    });
    res.status(201).json(cartItem);
};
export const putCartUpdate = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { productId, quantity } = req.body;
    const userId = req.user.userId;
    if (quantity === 0) {
        await prisma.cartItem.delete({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });
        return res.status(204).send();
    }
    const cartItem = await prisma.cartItem.update({
        where: {
            userId_productId: {
                userId,
                productId
            }
        },
        data: { quantity },
        include: { product: true }
    });
    res.json(cartItem);
};
export const deleteCartRemoveProductId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { productId } = req.params;
    const userId = req.user.userId;
    await prisma.cartItem.delete({
        where: {
            userId_productId: {
                userId,
                productId: parseInt(productId)
            }
        }
    });
    res.status(204).send();
};
export const postOrdersCreate = async (req, res) => {
    const userId = req.user.userId;
    const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true }
    });
    if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }
    let totalAmount = 0;
    const orderItems = [];
    for (const item of cartItems) {
        if (item.product.stockCount < item.quantity) {
            return res.status(400).json({
                error: `${item.product.name} is out of stock. Only ${item.product.stockCount} left.`
            });
        }
        totalAmount += item.product.price * item.quantity;
        orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: item.product.price
        });
    }
    const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
            data: {
                userId,
                totalAmount,
                status: 'pending',
                items: {
                    create: orderItems
                }
            }
        });
        for (const item of cartItems) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stockCount: { decrement: item.quantity } }
            });
        }
        await tx.cartItem.deleteMany({
            where: { userId }
        });
        return newOrder;
    });
    const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
            items: {
                include: {
                    product: true
                }
            },
            user: {
                include: {
                    profile: true
                }
            }
        }
    });
    res.status(201).json(fullOrder);
};
export const getOrders = async (req, res) => {
    const userId = req.user.userId;
    const orders = await prisma.order.findMany({
        where: { userId },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
};
export const getOrdersId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const userId = req.user.userId;
    const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            seller: {
                                include: {
                                    profile: true
                                }
                            }
                        }
                    }
                }
            },
            user: {
                include: {
                    profile: true
                }
            }
        }
    });
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: { include: { role: true } } }
    });
    const isAdmin = user?.roles.some(r => r.role.name === 'admin');
    if (!isAdmin && order.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
    }
    res.json(order);
};
export const postProductsIdReview = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;
    const product = await prisma.product.findUnique({
        where: { id: parseInt(id) }
    });
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    const review = await prisma.productReview.upsert({
        where: {
            productId_userId: {
                productId: parseInt(id),
                userId
            }
        },
        update: {
            rating,
            comment
        },
        create: {
            productId: parseInt(id),
            userId,
            rating,
            comment
        },
        include: {
            user: {
                include: {
                    profile: true
                }
            }
        }
    });
    res.status(201).json(review);
};
export const getProductcategories = async (req, res) => {
    const categories = await prisma.productCategory.findMany();
    res.json(categories);
};
