const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send({ Status: true, Message: 'Todo Server is running' })
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ujhfrio.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {

        const userCollection = client.db("todo").collection("user")
        const todoCollection = client.db("todo").collection("task")
        const todoCompleteCollection = client.db("todo").collection("Ctask")

        app.post('/adduser', async (req, res) => {
            const user = req.body;
            try {
                const filter = { email: user.email }
                const findUser = await userCollection.findOne(filter);
                if (findUser.email) {
                    return res.send({ message: "user already added" });
                }

                const result = await userCollection.insertOne(user);
                res.send(result)
            }
            catch {
                res.send("cann't add user")
            }
        })
        app.post('/addtask', async (req, res) => {
            const task = req.body;
            try {
                const result = await todoCollection.insertOne(task);
                res.send(result)
            }
            catch {
                res.send("cann't add task")
            }
        })
        app.post('/completetask', async (req, res) => {
            const task = req.body;
            const complete = { taskName: task.taskName, description: task.description, imageLink: task.imageLink, email: task.email }
            try {
                const result = await todoCompleteCollection.insertOne(complete);
                const id = task._id;
                const filter = { _id: ObjectId(id) }
                const deleteTodo = await todoCollection.deleteOne(filter);
                console.log(deleteTodo)
                if (deleteTodo.deletedCount) {
                    res.send(result)
                }


            }
            catch {
                res.send("cann't add task")
            }
        })
        app.get('/mytask', async (req, res) => {
            try {
                const email = req.query.email;
                const filter = { email: email }
                const result = await todoCollection.find(filter).toArray();
                res.send(result)
            }
            catch {
                res.send("cann't my task")
            }
        })
        app.get('/ctask', async (req, res) => {
            try {
                const email = req.query.email;
                const filter = { email: email }
                const result = await todoCompleteCollection.find(filter).toArray();
                res.send(result)
            }
            catch {
                res.send("cann't my task")
            }
        })
        app.delete('/deletectask', async (req, res) => {
            try {
                const id = req.query.id;
                console.log(id)
                const filter = { _id: ObjectId(id) }
                const result = await todoCompleteCollection.deleteOne(filter);
                console.log(result)
                res.send(result)
            }
            catch {
                res.send("cann't my task")
            }
        })
        app.delete('/deletetask', async (req, res) => {
            try {
                const id = req.query.id;
                console.log(id)
                const filter = { _id: ObjectId(id) }
                const result = await todoCollection.deleteOne(filter);
                console.log(result)
                res.send(result)
            }
            catch {
                res.send("cann't my task")
            }
        })

    }
    catch {
        res.send({ Status: false })
    }
}
run().catch(e => console.log(e))

app.listen(port, () => {
    console.log("Server is running", port)
})