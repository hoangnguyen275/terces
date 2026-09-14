import mongoose from "mongoose";

export const connectDB = async() => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log('Conected with database successfully!');
  } catch (error){
    console.error('Errors with connecting database!', error);
    process.exit(1);
  }
}