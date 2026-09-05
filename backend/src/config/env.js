import 'dotenv/config'


export const env = {
    port : process.env.PORT ,
    jwt_secert : process.env.JWT_SECRET,
    db:{
        host:process.env.DB_HOST,
        name:process.env.DB_NAME,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        port:process.env.DB_PORT,
    },
    environment:process.env.ENVIRONMENT
}

