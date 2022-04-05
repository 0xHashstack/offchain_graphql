const {Client} = require('pg')

const client = new Client({
    host: "localhost",
    port : 5432,
    user: "postgres",
    password: "Shrutika@123",
    database: "nikolashrutika"
})


// console.log("client", client)

client.on("connect", () =>{
    console.log("Database Conection")
})

client.on("end",()=>{
    console.log("connection end")
})

client.connect();

//let query = `SELECT * from wl_address`;
let query=  `SELECT * from accounts`


client.query(query, (err, res)=>{
    if(!err){
        console.log(res.rows);
    } else{
        console.log(err.message)
    }
    client.end;
})