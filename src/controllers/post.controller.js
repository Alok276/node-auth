import 
{
createPost,
getMyPosts,
getPost,
updatePost,
deletePost
} from "../services/post.service.js"



export async function create(req, res){

    const post = await createPost({
       title: req.body.title, 
       content: req.body.content, 
      userId:  req.user.userId
    }
    );

    return res.status(201).json(post);
}


export async function getMine(req, res) {


    const posts = await getMyPosts(
                req.user.userId, 
                req.query);

    return res.json(posts);
}


//get my one post
export async function getOne(req, res) {

    const post = await getPost(req.params.id);

    return res.json(post);
}

//update my post
export async function update(req, res) {

    const post = await updatePost(
        req.params.id,
        req.user.userId,
        req.body
    );

    return res.status(201).json(post);
}

//delete post 
export async function remove(req, res){

     await deletePost(
        req.params.id,
        req.user.userId);

    return res.json("Deleted Successfully");

}


