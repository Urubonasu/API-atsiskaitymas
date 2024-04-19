import express from 'express'
import mongoose from 'mongoose'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));

app.set('view engine', 'ejs')

mongoose.connect('mongodb+srv://arnoldasurbo:nFTm81HxdZmmK6UF@cluster0.aoflxyk.mongodb.net/Games')

const gamesSchema = {
    name: { type: String, required: true },
    genre: [String],
    review: String,
    pegi: Number,
    platform: [String]
}

const Game = mongoose.model('Game', gamesSchema)

const handleErrors = (err) => {
    let errors = { name: '', genre: '', review: '', pegi: '', platform: '' };
    if (err.message.includes('validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            if (properties) {
                errors[properties.path] = properties.message;
            }
        });
    }
    return errors;
}

// GET - gauti zaidimu sarasa
app.get('/', async (req, res) => {
    try {
        const games = await Game.find({});
        res.render('index', {
            gamesList: games
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

// GET - gauti zaidima 
app.get('/:id', (req, res) => {
    const id = req.params.id
    Game.findById(id)
        .then(result => {
            res.render('game', {game: result, title: 'Game details'})
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error');
        })
})

//POST prideti zaidima prie saraso
app.post('/', async (req, res) => {
    const { name, genre, review, pegi, platform } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    try {
        const genreArray = genre ? genre.split(',').map(item => item.trim()) : [];
        const platformArray = platform ? platform.split(',').map(item => item.trim()) : [];
        await Game.create({ name, genre: genreArray, review, pegi, platform: platformArray });
        res.redirect('/');
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
})

// DELETE - istrinti zaidimo pasiulyma
app.delete('/:id', (req, res) => {
    const id = req.params.id

    Game.findByIdAndDelete(id)
    .then(result => {
        res.json({ redirect: '/' })
    })
    .catch(err => {
        console.log(err);
        res.status(500).send('Internal Server Error');
    })
})

app.listen(3000, () => {
    console.log('serveris pradetas')
})


