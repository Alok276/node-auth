import { appError } from "../utils/appError.js"


export function  authorize(...roles) {

    return (req, res, next) => {

        if(!roles.includes(req.user.role)){
            return next(
                new appError('Forbiddin', 403)
            );
        }
        next();
    }

}