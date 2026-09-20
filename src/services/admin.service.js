import { db } from "../prisma/db.ts";
import { appError } from "../utils/appError.js";


export async function getAllUserServices(){

    return db.orm.public.User.all();
}

export async function deleteUserService(id) {

    const user = await db.orm.public.User
                        .where({ id: Number(id)})
                        .first();

    if(!user){
        throw new appError("User Not Found", 404);
    }

    await db.orm.public.User
          .where({id: Number(id)})
          .delete();

    return true;
}