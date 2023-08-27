const z = require('zod'); // Para hacer validaciones de forma eficiente

// VALIDACIONES
const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string.',
        required_error: 'Movie title is required.'
    }),
    year: z.number().int().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(0),
    poster: z.string().url({
        message: 'Poster must be a valid URL'
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi', 'Crime']),
        {
            required_error: 'Movie genre is required',
            invalid_type_error: 'Movie genre must be an array of enum Genre'
        }
    )
})

function validateMovie(obj) {
    return movieSchema.safeParse(obj) // safeParse devuelve un objeto result que te dice si hay error o datos y con un if se valida bien
}

function validatePartialMovie(input) {
    return movieSchema.partial().safeParse(input);  // partial -> todas las propiedades se convierten en opcionales, 
                                                    // si no está, no pasa nada, y si está, la valida como debe
}

module.exports = {
    validateMovie,
    validatePartialMovie
}
