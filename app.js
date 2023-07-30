const express = require('express')
const app = express()
const mongoose = require("mongoose")
const User = require('./api/Model/User')
const bcrypt = require('bcryptjs');
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const Post = require('./api/Model/Post')
const multer = require('multer');
const fs = require('fs')
const upload = multer({ dest: 'upload/' })
const salt = bcrypt.genSaltSync(10);
const secret = 'asdfghjkwertyuiodfghjkertyui456d5444sdfgnghjkfeteturiy45dgdty45rtdtddt'
const port = process.env.PORT || 3000;

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(express.json())
app.use(cookieParser());
app.use('/upload', express.static(__dirname + '/upload'));

mongoose.connect('mongodb+srv://muzmuh200322:i18kUH1MF3Hl2wOX@cluster0.pmfs9ax.mongodb.net/?retryWrites=true&w=majority').catch(err => console.log(err));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({ username, password: bcrypt.hashSync(password, salt) });
        res.json(userDoc);
    } catch (e) {
        res.status(400).json(e);
    }
});

app.post('/login', async (req, res) => {
    const { Username, Password } = req.body
    const Userdoc = await User.findOne({ username: Username });
    if (Userdoc !== null) {
        const passok = bcrypt.compareSync(Password, Userdoc.password);
        if (passok) {
            // logged inrs
            jwt.sign({ Username, id: Userdoc.id }, secret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token ,{sameSite: "none", secure:"true" }).json({
                    id: Userdoc._id,
                    Username,
                })
            })
        } else {
            res.status(400).json('Wrong Crendentials');
        }
    } else {
        res.status(404).json('Wrong Crendentials')
    }

});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err;
        res.json(info);
    });
    res.json('jguhihk')
});

app.post('/logout', (req, res) => {
    res.cookie('token', '', {sameSite: "none", secure:"true" }).json('ok')
})

app.post('/post', async (req, res) => {
    // const { originalname, path } = req.file;
    // const parts = originalname.split('.');
    // const ext = parts[parts.length - 1];
    // const newPath = path + '.' + ext;
    // fs.renameSync(path, newPath);

    // const { token } = req.cookies;
    // jwt.verify(token, secret, {}, async (err, info) => {
    //     if (err) throw err;
    //     const { title, summary, content } = req.body;
    //     const postDoc = await Post.create({
    //         title,
    //         summary,
    //         content,
    //         cover: newPath,
    //         author: info.id,
    //     })
    //     res.json(postDoc);
    // });
    res.json('dfasdfksldjf')
})

app.get('/posts', async (req, res) => {

    res.status(200).json(await Post.find()
        .populate('author', ['username'])
        .sort({ createdAt: -1 })
        .limit(20))
});

app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})

app.delete('/post/delete/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id);
    await postDoc.deleteOne();
    res.json('done');
})

app.put('/post', upload.single('file'), async (req, res) => {
    let newPath = null;
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }


    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            return res.status(400).json('you are not the author')
        }
        await postDoc.updateOne({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
        })

        res.json(postDoc);
    });

})

app.get('*', (req, res, next) => {
    res.status(200).json({
        message: 'success'
    })
})

app.listen(port,()=> { console.log(`port 3000`)})


// i18kUH1MF3Hl2wOX
// mongodb+srv://muzmuh200322:i18kUH1MF3Hl2wOX@cluster0.pmfs9ax.mongodb.net/?retryWrites=true&w=majority