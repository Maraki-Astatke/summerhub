import { Router, Request, Response } from "express";
import { body, query, param, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import prisma from "../lib/prisma.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
export const blogLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many blog posts. Try again later.' }
});
export const postBlogPosts = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { title, content, imageUrl, publishedAt } = req.body;
const authorId = req.user.userId;

const post = await prisma.blogPost.create({
  data: {
    title,
    content,
    authorId,
    imageUrl,
    publishedAt: publishedAt ? new Date(publishedAt) : new Date()
  },
  include: {
    author: {
      include: {
        profile: true
      }
    }
  }
});

res.status(201).json(post);
};
export const getBlogPosts = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { authorId, search, published, page = 1, limit = 20 } = req.query;
const pageNum = parseInt(page as string);
const limitNum = parseInt(limit as string);
const skip = (pageNum - 1) * limitNum;

const where: any = {};

if (authorId) {
  where.authorId = parseInt(authorId as string);
}

if (search) {
  where.OR = [
    { title: { contains: search as string, mode: 'insensitive' } },
    { content: { contains: search as string, mode: 'insensitive' } }
  ];
}

if (published === 'true') {
  where.publishedAt = { not: null };
  where.publishedAt = { lte: new Date() };
}

const [posts, total] = await Promise.all([
  prisma.blogPost.findMany({
    where,
    include: {
      author: {
        include: {
          profile: true
        }
      },
      comments: {
        include: {
          user: {
            include: {
              profile: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      likes: true
    },
    skip,
    take: limitNum,
    orderBy: { createdAt: 'desc' }
  }),
  prisma.blogPost.count({ where })
]);

const postsWithLikeCount = posts.map(post => ({
  ...post,
  likeCount: post.likes.length,
  commentCount: post.comments.length
}));

res.json({
  data: postsWithLikeCount,
  pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum)
  }
});
};
export const getBlogPostsId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;

const post = await prisma.blogPost.findUnique({
  where: { id: parseInt(id) },
  include: {
    author: {
      include: {
        profile: true
      }
    },
    comments: {
      include: {
        user: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    },
    likes: {
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    }
  }
});

if (!post) {
  return res.status(404).json({ error: 'Post not found' });
}

const likeCount = post.likes.length;
const commentCount = post.comments.length;

res.json({
  ...post,
  likeCount,
  commentCount
});
};
export const putBlogPostsId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const { title, content, imageUrl, publishedAt } = req.body;
const userId = req.user.userId;

const existingPost = await prisma.blogPost.findUnique({
  where: { id: parseInt(id) }
});

if (!existingPost) {
  return res.status(404).json({ error: 'Post not found' });
}

const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { roles: { include: { role: true } } }
});

const isAdmin = user?.roles.some(r => r.role.name === 'admin');

if (!isAdmin && existingPost.authorId !== userId) {
  return res.status(403).json({ error: 'You can only edit your own posts' });
}

const updateData: any = {};
if (title) updateData.title = title;
if (content) updateData.content = content;
if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
if (publishedAt) updateData.publishedAt = new Date(publishedAt);

const post = await prisma.blogPost.update({
  where: { id: parseInt(id) },
  data: updateData,
  include: {
    author: {
      include: {
        profile: true
      }
    }
  }
});

res.json(post);
};
export const deleteBlogPostsId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const userId = req.user.userId;

const existingPost = await prisma.blogPost.findUnique({
  where: { id: parseInt(id) }
});

if (!existingPost) {
  return res.status(404).json({ error: 'Post not found' });
}

const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { roles: { include: { role: true } } }
});

const isAdmin = user?.roles.some(r => r.role.name === 'admin');

if (!isAdmin && existingPost.authorId !== userId) {
  return res.status(403).json({ error: 'You can only delete your own posts' });
}

await prisma.blogPost.delete({
  where: { id: parseInt(id) }
});

res.status(204).send();
};
export const postBlogPostsIdComments = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const { content } = req.body;
const userId = req.user.userId;

const post = await prisma.blogPost.findUnique({
  where: { id: parseInt(id) }
});

if (!post) {
  return res.status(404).json({ error: 'Post not found' });
}

const comment = await prisma.blogComment.create({
  data: {
    postId: parseInt(id),
    userId,
    content
  },
  include: {
    user: {
      include: {
        profile: true
      }
    }
  }
});

res.status(201).json(comment);
};
export const deleteBlogCommentsId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const userId = req.user.userId;

const existingComment = await prisma.blogComment.findUnique({
  where: { id: parseInt(id) },
  include: { post: true }
});

if (!existingComment) {
  return res.status(404).json({ error: 'Comment not found' });
}

const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { roles: { include: { role: true } } }
});

const isAdmin = user?.roles.some(r => r.role.name === 'admin');

if (!isAdmin && existingComment.userId !== userId) {
  return res.status(403).json({ error: 'You can only delete your own comments' });
}

await prisma.blogComment.delete({
  where: { id: parseInt(id) }
});

res.status(204).send();
};
export const postBlogPostsIdLike = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const userId = req.user.userId;

const post = await prisma.blogPost.findUnique({
  where: { id: parseInt(id) }
});

if (!post) {
  return res.status(404).json({ error: 'Post not found' });
}

const like = await prisma.blogLike.upsert({
  where: {
    postId_userId: {
      postId: parseInt(id),
      userId
    }
  },
  update: {},
  create: {
    postId: parseInt(id),
    userId
  }
});

res.status(201).json(like);
};
export const deleteBlogPostsIdUnlike = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const userId = req.user.userId;

await prisma.blogLike.delete({
  where: {
    postId_userId: {
      postId: parseInt(id),
      userId
    }
  }
});

res.status(204).send();
};
