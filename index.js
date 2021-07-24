const express = require("express")
const fetch = require('node-fetch');
const fs = require("fs")
const http = require("http")
const app = express()
const PORT = process.env.PORT || 3001

// Functions
const toS = (json)=>{return JSON.stringify(json)}
const toJ = (string)=>{return JSON.parse(string)}
const sendHelp = (res)=>{res.sendFile(__dirname+"/help.txt")}
const getDbPath = (name)=>{ return __dirname+'/dbs/'+name+'.json'}
const CheckRequiredArgs = (args,query)=>{
	var message = null
	args.forEach((arg)=>{
		if(!query[arg] && message==null) {message = "Missing argument : "+arg;}
	})
	return message
}

//Request Manager
app.get('/',(req,res)=>{sendHelp(res)})
app.get('/create',(req,res)=>{
	res.header("Content-Type",'application/json');
	checkArgs = CheckRequiredArgs(['db','pass'],req.query)
	if(!checkArgs && !fs.existsSync(getDbPath(req.query.db)))
	{
		console.log("Create request : "+req.query.db)
		data = {pass:req.query.pass,data:[]}
		fs.writeFileSync(getDbPath(req.query.db),toS(data))
		res.send({code:200})
	}
	else {
		if(checkArgs) error = checkArgs
		if(fs.existsSync(getDbPath(req.query.db))) error = "Database already exists."
		res.send({code:400,message:error})
	}
})

app.get('/delete',(req,res)=>{
	res.header("Content-Type",'application/json');
	checkArgs = CheckRequiredArgs(['db','pass'],req.query)
	if(!checkArgs)
	{
		try{
			data = toJ(fs.readFileSync(getDbPath(req.query.db)).toString())
		}
		catch {
			res.send({code:404,message:"Database not found."})
			return;
		}
		if(toJ(data).pass==req.query.pass){
			console.log("Delete request : "+req.query.db)
			fs.unlinkSync(getDbPath(req.query.db))
			res.send({code:200})
		}
		else
		{
			if(data.pass!=req.query.pass) error = "Wrong password."
			res.send({code:400,message:error})
		}
	}
	else {
		if(checkArgs) error = checkArgs
		res.send({code:400,message:error})
	}
})

app.get('/get',(req,res)=>{
	res.header("Content-Type",'application/json');
	checkArgs = CheckRequiredArgs(['db'],req.query)
	if(!checkArgs && fs.existsSync(getDbPath(req.query.db)))
	{
		console.log("Get request : "+req.query.db)
		data = JSON.parse(fs.readFileSync(getDbPath(req.query.db)).toString()).data
		res.send(data)
	}
	else {
		if(!fs.existsSync(getDbPath(req.query.db))) {code=404;error = "Database not found."}
		if(checkArgs) {code=400;error = checkArgs}
		res.send({code,message:error})
	}
})


app.get('/pushEntry',(req,res)=>{
	res.header("Content-Type",'application/json');
	checkArgs = CheckRequiredArgs(['db','pass','data'],req.query)
	if(!checkArgs)
	{
		try{
			data = toJ(fs.readFileSync(getDbPath(req.query.db)).toString())
		}
		catch {
			res.send({code:404,message:"Database not found."})
			return;
		}
		if(data.pass==req.query.pass){
			console.log("PushEntry request : "+req.query.db)
			data.data.push(toJ(req.query.data))
			fs.writeFileSync(getDbPath(req.query.db),toS(data))
			res.send(data.data)
		}
		else
		{
			if(data.pass!=req.query.pass) error = "Wrong password."
			res.send({code:400,message:error})
		}
	}
	else {
		if(checkArgs) error = checkArgs
		res.send({code:400,message:error})
	}
})

app.get('/setEntry',(req,res)=>{
	res.header("Content-Type",'application/json');
	checkArgs = CheckRequiredArgs(['db','pass','index','data'],req.query)
	if(!checkArgs)
	{
		try{
			data = toJ(fs.readFileSync(getDbPath(req.query.db)).toString())
		}
		catch {
			res.send({code:404,message:"Database not found."})
			return;
		}
		if(data.pass==req.query.pass){
			console.log("SetEntry request : "+req.query.db)
			index = parseInt(req.query.index)
			data.data[index] = toJ(req.query.data)
			fs.writeFileSync(getDbPath(req.query.db),toS(data))
			res.send(data.data)
		}
		else
		{
			if(data.pass!=req.query.pass) error = "Wrong password."
			res.send({code:400,message:error})
		}
	}
	else {
		if(checkArgs) error = checkArgs
		res.send({code:400,message:error})
	}
})

app.get('/deleteEntry',(req,res)=>{
	res.header("Content-Type",'application/json');
	checkArgs = CheckRequiredArgs(['db','pass','index'],req.query)
	if(!checkArgs)
	{
		try{
			data = toJ(fs.readFileSync(getDbPath(req.query.db)).toString())
		}
		catch {
			res.send({code:404,message:"Database not found."})
			return;
		}
		if(data.pass==req.query.pass){
			console.log("DeleteEntry request : "+req.query.db)
			index = parseInt(req.query.index)
			for( var i = 0; i < data.data.length; i++){ 
				if ( i === index) { 
					data.data.splice(i, 1); 
				}
			}
			fs.writeFileSync(getDbPath(req.query.db),toS(data))
			res.send(data.data)
		}
		else
		{
			if(data.pass!=req.query.pass) error = "Wrong password."
			res.send({code:400,message:error})
		}
	}
	else {
		if(checkArgs) error = checkArgs
		res.send({code:400,message:error})
	}
})

//Send app
app.listen(PORT,()=>{console.log(`Ready at port ${PORT} !`)})