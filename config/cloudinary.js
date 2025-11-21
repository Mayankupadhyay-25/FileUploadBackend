const cloudinary = requier("cloudinary").v2;

exports.cloudinaryconnect = () =>  {
    try{
        cloudinary.config({
            cloude_name:process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECREAT,

        })
    }
catch(error){
    console.log(error);
}
}