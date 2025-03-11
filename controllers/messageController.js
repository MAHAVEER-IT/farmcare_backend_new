import IndividualMessage from '../models/Message.js';
import { v4 as uuidv4 } from 'uuid';

export const createMessage =async (req,res)=>{
    const {userId1,userId2,content,messageType,messagedUserId}=req.body;

    if(!userId1 || !userId2 || !content || !messagedUserId){
        return res.status(400).json({ message: "All fields are required" });
    }
    try{
        let chat=await IndividualMessage.findOne({userId1,userId2});

        if(!chat){
            chat=new IndividualMessage({
                communicationId: uuidv4(),
                userId1,
                userId2,
                messages: [{
                    messageId:uuidv4(),
                    messagedUserId,
                    content,
                    messageType,
                }],
                updatedAt:new Date(),
            });
        }else{
            chat.messages.push({
                messageId:uuidv4(),
                messagedUserId,
                content,
                messageType,
            });
            chat.updatedAt=new Date();
        }
        await chat.save();
        res.status(200).json({ message: 'Message sent successfully', chat });
    }catch(error){
        console.log(error);
    }
}