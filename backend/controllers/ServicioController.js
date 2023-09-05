import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsers = async (req, res) =>{
    try {
        const response = await prisma.user.findMany();
        res.status(200).json(response);
    }catch(e){
        res.status(500).json({msg:e.message});
    }
}

export const getUsersById = async (req, res) =>{
    try {
        const response = await prisma.user.findUnique({
            where:{
                id_user: Number(req.params.id)
            }
        });
        res.status(200).json(response);
    }catch(e){
        res.status(404).json({msg:e.message});
    }
}

export const createUser = async (req, res) =>{
    const {name, email, accessToken, phone, rol, pass} = req.body;
    try {
        const user = await prisma.user.create({
            data:{
                name: name,
                email: email,
                accessToken: accessToken,
                phone: phone,
                rol: rol,
                pass: pass
            }
        });
        res.status(201).json(user);
    }catch(e){
        res.status(400).json({msg:e.message});
    }
}

export const updateUser =  async (req, res) =>{
    const {name, email, accessToken, phone, rol, pass} = req.body;
    try {
        const user = await prisma.user.update({
            where:{
                id_user: Number(req.params.id)
            },
            data:{
                name: name,
                email: email,
                accessToken: accessToken,
                phone: phone,
                rol: rol,
                pass: pass
            }
        });
        res.status(200).json(user);
    }catch(e){
        res.status(400).json({msg:e.message});
    }
}

export const deleteUser =  async (req, res) =>{
    //const {name, accessToken, email, phone, rol, pass} = req.body;
    try {
        const user = await prisma.user.delete({
            where:{
                id_user: Number(req.params.id)
            }
        });
        res.status(200).json(user);
    }catch(e){
        res.status(400).json({msg:e.message});
    }
}

// PARA DESHABILITAR TEMPORALMENTE UNA FK y hacer que servicio pueda tener FK vacias
// const vehicle = await prisma.vehicle.update({
//     where: {
//       id,
//     },
//     data: {
//       Vehicle_Model_Category: {
//         disconnect: true,
//       },
//     },
//   });