import {NextFunction, Request, Response} from 'express'
import {query} from "../database/db"


export const checkUserData = (checkForAllFields : boolean) => {

    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const {name, email, password} = req.body
        try {
            if ((!name && checkForAllFields) || !email || !password) {
                return res.status(403).json({message: "All fields are required!"})
            } else {
                next();
            }
        } 
        catch(err) {
            console.log(err)
            return res.status(500).json({message: "Internal server error!"})
    }
    }
}

