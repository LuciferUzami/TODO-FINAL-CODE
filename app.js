const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const lodash = require("lodash")


const app = express()
app.use(bodyParser.urlencoded ({extended: true}))

// Connect CSS and Image
app.use(express.static("public"))

// Set Up for ejs file system ...  
app.set("view engine", "ejs")  

// Connect the Mongodb Local servier
mongoose.connect("mongodb+srv://Praveen:lucifer@cluster0.lmxc0pv.mongodb.net/todolist")
// mongoose.connect("mongodb://localhost:27017/todolist")

// Schema
const todoSchema = {
    name:{
        type: String,
    }
}

// Schema for list
const listSchema = {
    name: String,
    list_todo: [todoSchema]
}

// Create a model
const ToDo = new mongoose.model("ToDo", todoSchema)

// Create model for list
const List = new mongoose.model("List", listSchema)

// Document
const item1 = new ToDo({
    name: "Welcome to ToDo-List"
})

const item2 = new ToDo({
    name: "Type the input box and click the + button"
})

const item3 = new ToDo({
    name: "<------ Hit this to delete an item"
})

// Array
const default_items = [item1, item2, item3]


// Main Root
app.get("/", function(req, res){
    // Find
    ToDo.find({}).then((foundItems) =>{
        // Conditon for Insert default values
        if (foundItems.length === 0){
            ToDo.insertMany(default_items).then(() =>{
                console.log("Insert Default Items!!!")
            })
            // Redirect the servier to rendering values
            res.redirect("/")
        }else{
            res.render("list", {titles: "Today", todo: foundItems})
        }
        
    }).catch((Error) =>{
        console.log(Error)
    })

})

// Get the user input
app.post("/", function(req, res){
    // Get the input value
    let todo_item = req.body.todo_input
    let list_name = req.body.list  

    // Create Model
    const item = new ToDo({
        name: todo_item
    })

    // Condition
    if (list_name === "Today"){
        item.save()
        res.redirect("/")
    }else{
        List.findOne({name: list_name}).then((foundlist) =>{
            foundlist.list_todo.push(item)
            foundlist.save()
            res.redirect("/" + list_name)
        })
    }
})

// Root for delete
app.post("/delete", function(req, res){
    const checkIditem = req.body.checkbox
    const button_route_value = req.body.hidden_btn

    // Condition for Deleteing
    if (button_route_value === "Today"){
        ToDo.deleteOne({_id: checkIditem}).then(() =>{
            console.log("Deleted Successful")
            res.redirect("/")
        }).catch((Error) =>{
            console.log(Error)
        })
    }else{
        List.findOneAndUpdate({name: button_route_value},{$pull: {list_todo: {_id: checkIditem}}}).then(() =>{
            console.log("Updated")
            res.redirect("/" + button_route_value)
        }).catch((Error) =>{
            console.log(Error)
        })
    }
    
})

// Finish Route
app.get("/:routeName", function(req, res){
    // Get Route Name
    const routename = lodash.capitalize(req.params.routeName)

    // Condition
    List.findOne({name :routename}).then((result) =>{
        if (result.name === routename ){
            res.render("list", {
                titles: result.name,
                todo: result.list_todo
            })
        }
    }).catch(() =>{
        // Creat a new document
        const list = new List({
            name: routename,
            list_todo: default_items
        })
        list.save().then(() =>{
            console.log("New route list has been saved")
            res.redirect("/" + routename)
        })
        // Redirect
        
    })

})

// Local Seriver
app.listen(3000, function(){
    console.log("Server 3000 has been connecting....")
})