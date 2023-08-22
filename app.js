//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB");

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list"
});

const item2 = new Item({
  name: "Use + button to add an item"
});

const item3 = new Item({
  name: "<-- Use this to delete an item"
});

const defaultItems = [item1, item2 ,item3];

const listsSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listsSchema);


// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Saved Default Items");
//   }
// });



app.get("/", function(req, res) {
    Item.find({}, function(err, items){
        // console.log(items);
      if(items.length === 0){
        
          Item.insertMany(defaultItems, function(err){
            if(err){
              console.log(err);
            }
            else{
              console.log("Saved Default Items");
              res.redirect("/");
            }
        });
      }
      else
         res.render("list", {listTitle: "Today", newListItems: items});
    });
    // res.render("list", {listTitle: "Today", newListItems: items});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  if(req.body.list === "Today"){
    item.save();  // saves it to the defaultItems list
    res.redirect("/");
  }
  else{
    List.findOne({name: req.body.list}, function(err, found){
      found.items.push(item);
      found.save();
      res.redirect("/" + found.name);
    })
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  // res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  console.log(req.body.checkbox);
  console.log(req.body.listName);
  if(req.body.listName === "Today"){
    Item.deleteOne({_id:req.body.checkbox}, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Deleted Item");
      }
    });
    
    res.redirect("/");
  }
  else{
    List.findOne({name: req.body.listName}, function(err, found){
      console.log(found);
      found.items.deleteOne({_id: req.body.checkbox}, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Deleted");
        }
      })
      res.redirect("/" + found.name);
    });
  }
})


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:listName", function(req, res){
  // console.log(req.params.listName);
  const listName = req.params.listName;

  List.findOne({name: listName}, function(err, found){
    if(!err){
      if(!found){
        console.log("Does not exist");
        
        
        // create a new list, if it does not exist
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();

        res.redirect("/"+ listName);

      }
      else{
        console.log("List Exists");
        console.log(found.name);
        console.log(found.items);
        res.render("list", {listTitle: found.name, newListItems: found.items});
      }
    }
  })

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});