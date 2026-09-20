import {
    getAllUserServices,
    deleteUserService
} from '../services/admin.service.js';

export async function getAllUsers(req, res){

  const users = await getAllUserServices();

   return res.json(users)
}

export async function deleteUser(req, res){

    const result = await deleteUserService(req.params.id);

    return  res.json({
        message : 'user deleted successfully'
    });
}