const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const Todo = require("./listModel");
const custTodo = require('./newListModel');

const app = express();

//setting app to use EJS
app.set("view engine", "ejs");

//making use of BodyParser
app.use(bodyParser.urlencoded({extended:true}));
//telling app where to find external file (like css file, or images that may be added)
app.use(express.static("public"));

//Connecting to the database server
run().catch(err => console.log(err.message));
async function run(){
    await mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true,useUnifiedTopology: true,family: 4});
    console.log("Connected to Database Sever");
}

//the "Home" route
app.get("/", async(req,res) =>{
    
    // let today = new Date();
    // let options = {
    //     weekday : "long",
    //     day : "numeric",
    //     month : "long"
    //     //year : "numeric"
    // };
    // let day = today.toLocaleDateString("en-US", options);

    const pageTitle = "Main List";

    const listItems = await Todo.find();
    if (listItems.length === 0) {
        //Wrapping the creation of items in a try catch to prevent errors in case something doesn't work
        try {

            //adding items into the database
            const item1 = await Todo.create({
                name: "Item 1"
            });
            const item2 = await Todo.create({
                name: "Item 2"
            });
            const item3 = await Todo.create({
                name: "Item 3"
            });
        }catch (error) {
            //catching any error and displaying the message
            console.log(error.message);
        }
        // finally{
        //     //closing the connection to the database server once finish using it
        //     await mongoose.connection.close();
        // }

        //redirecting to the home route
        res.redirect("/");
    } else {
        /* res.render is used once and all EJS variable need to be rendered at the same time */
        //listTitle and newListitem are ejs "variables" used to pass values from a js file to a ejs file 
        res.render("list",{listTitle : pageTitle, newListitem : listItems});
    }

});

app.post("/", async (req,res) =>{
    const item = req.body.newItem;
    const listTi = req.body.list;
    const match = await custTodo.findOne({name: listTi});
    

    if(listTi === await match.name){
        //adding new item into the work list
        try {
            const newIte = new Todo({
                name: item
            })
            await match.tasks.push(newIte);
            await match.save();
        } catch (error) {
            console.log(error.message);
        }
        //redirecting to the work route
        res.redirect("/"+listTi);
    }else{
        try {
            const nwTtem = await Todo.create({
                name: item
            });
        } catch (error) {
            console.log(error.message);
        } 
        // finally{
        //     await mongoose.connection.close();
        // }
        // res.redirect points to the home root ("/")
        res.redirect("/");
    }
    
});

app.post("/delete", async (req,res) =>{
    const itemDel = req.body.checkbox;
    const listName = req.body.list;
    const match = await custTodo.findOne({name: listName});

    if (match.name === listName) {
        try {
            await custTodo.updateOne({name:listName},
                {$pull: {
                    tasks: {_id: itemDel}
                }});
            console.log("worked");
        } catch (error) {
            console.log(error.message);
        }
        res.redirect("/"+listName);
    } else {
        try {
            await Todo.deleteOne({_id: itemDel});
        } catch (error) {
            console.log(error.message);
        }
        res.redirect("/");
    }

    
});

//route to a custom path
app.get("/:pageId",async (req,res) =>{
    const pageTitle = _.capitalize(req.params.pageId);

    const match = await custTodo.findOne({name: pageTitle});
    
    if(!match){
        console.log("match doesn't exist");
        try {
            const newCustList = await custTodo.create({
                name: pageTitle,
                tasks: []
            });
            console.log("saved");
        } catch (error) {
            console.log(error.message);
        }
        res.redirect("/"+pageTitle);
    }else{
        //console.log("match does exist");
        res.render("list",{listTitle: match.name, newListitem: match.tasks});
        
    }   
});

app.get("/about", (req,res)=>{
    res.render("about");
});

app.listen(3000, ()=>{
    console.log("Server running on port 3000");
});