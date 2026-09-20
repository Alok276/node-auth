import { db } from '../prisma/db.ts';
import { appError } from '../utils/appError.js';


// create a post 
export async function createPost({title, content, userId}) {

    const post = await db.orm.public.Post.create({
                 title,
                 content,
                 userId
    })

    return post;
}



//get all the posts of user
export async function getMyPosts(
  userId,
  { page = 1, limit = 10, search, published, sort = 'createdAt', order = 'desc' } = {}
) {

    const safePage = Number(page) || 1;
    const safeLimit = Number(limit) || 10;
    const offset = (safePage - 1) * safeLimit;

  let query = db.orm.public.Post.where({ userId });

  if (published !== undefined) {
    query = query.where({
      published: published === 'true'
    });
  }

  if (search) {
    query = query.where({
      title: {
        contains: search
      }
    });
  }

  if (sort === 'createdAt') {
    query = query.orderBy((p) => order === 'asc' ? p.createdAt.asc() : p.createdAt.desc());
  } else if (sort === 'updatedAt') {
    query = query.orderBy((p) => order === 'asc' ? p.updatedAt.asc() : p.updatedAt.desc());
  } else if (sort === 'title') {
    query = query.orderBy((p) => order === 'asc' ? p.title.asc() : p.title.desc());
  }

        // Pagination
    const posts = await query
        .limit(safeLimit)
        .offset(offset)
        .all();

        // Total
    let totalQuery = db.orm.public.Post.where({ userId });

    if (published !== undefined) {
      totalQuery = totalQuery.where({
        published: published === 'true'
      });
    }

    if (search) {
      totalQuery = totalQuery.where({
        title: {
          contains: search
        }
      });
    }

    const { total } = await totalQuery.aggregate((agg) => ({
      total: agg.count()
    }));

      const totalPages = Math.ceil(total / safeLimit);

    return {
        data : posts,
        pagination :{
            page: safePage,
            limit: safeLimit,
            search,
            published,
            totalPages
        }

    };
}


// get one post by id
export async function getPost(id) {

  const post = await db.orm.public.Post
    .where({ id: Number(id) }).first();
   

  if (!post) {
    throw new appError('Post not found', 404);
  }

  return post;
}


//update post
export async function updatePost(
  id,
  userId,
  { title, content }
) {

  const post = await db.orm.public.Post
    .where({ id: Number(id) })
    .first();

  if (!post) {
    throw new appError('Post not found', 404);
  }

  if (post.userId !== userId) {
    throw new appError('You do not own this post', 403);
  }

  const updatedPost = await db.orm.public.Post
    .where({ id: Number(id) })
    .update({
      title,
      content
    });

  return updatedPost;
}


//delete post 
export async function deletePost(id, userId) {


    const post = await db.orm.public.Post
           .where({id: Number(id)})
           .first();


    if(!post){
        throw new appError("Post not found", 404);
    }

    if(userId != post.userId){
        throw new appError("You do not own the post", 403);
    }

    await db.orm.public.Post
           .where({id: Number(id)})
           .delete();

    return true;
}