const express = require('express');
const app = express();
const movies = require('./movies.json');
const crypto = require('crypto'); // Biblioteca nativa de Node para poder crear id's unicas entre otras cosas
const { validateMovie, validatePartialMovie } = require('./Schemas/movies');
// Podemos solucionar tambien el cors mediante un middleware:
// const cors = require('cors');

//app.use(cors());

app.use(express.json());
app.disable('x-powered-by');

const PORT = process.env.PORT ?? 1234;

// app.get('/', (req, res) => {
//     res.json({ message: 'hola mundo' });
// })

//CORS:
//Metodos normales: GET,POST,HEAD
//Metodos complejos: PUT, PATCH, DELETE -> CORS PRE-FLIGHT -> Peticion OPTIONS

const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234',
    'http://movies.com',
    'http://midu.dev'
]

app.get('/movies', (req, res) => {
    const origin = req.header('origin') //El navegador no solicita ni envia esta cabecera desde el mismo dominio en el que se solicita un recurso

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin) // Damos permiso del CORS para obtener los recursos desde el dominio que especificamos
    }

    const { genre } = req.query;
    if (genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(gen => gen.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies);
    }

    res.json(movies);
})

app.get('/movies/:id', (req, res) => { // path-to-regexp -> biblioteca
    const { id } = req.params;
    const movie = movies.find(movie => movie.id === id);
    if (movie) return res.json(movie);

    res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)

    if (result.error) {
        return res.status(400).json({
            error: JSON.parse(result.error.message)
        })
    }

    const newMovie = {
        id: crypto.randomUUID(), // uuid-v4 -> Generamos Identificador unico universal random
        ...result.data
    }

    movies.push(newMovie);

    res.status(201).json(newMovie) // actualizar la caché del cliente
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)
    
    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) { // Pelicula no encontrada
        return res.status(404).json({
            message: 'Movie not found'
        })
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }
    

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
    const origin = req.header('origin')

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin) // Damos permiso del CORS para obtener los recursos desde el dominio que especificamos
    }

    const { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id);

    if (movieIndex === -1) { // Pelicula no encontrada
        return res.status(404).json({
            message: 'Movie not found'
        })
    }

    movies.splice(movieIndex, 1)
    return res.json({ message: 'Movie deleted' })

})

app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin')
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin) // Damos permiso del CORS para obtener los recursos desde el dominio que especificamos
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH')
    }
    res.send(200);
})

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`);
})

// REST -> Arquitectura de software: Visibilidad, Simplicidad, Escalabilidad, Portabilidad, Fiabilidad, Facil de modificar.
