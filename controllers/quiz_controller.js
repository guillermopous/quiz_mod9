var models = require( "../models/models.js" );

exports.load = function ( req, res, next, quizId ) {
    models.Quiz.find( quizId ).then( function ( quiz ) {
        if ( quiz ) {
            req.quiz = quiz;
            next();
        } else {
            next( new Error( "No existe quizId=" + quizId ) );
        }
    } ).catch( function ( error ) {
        next( error );
    } );
}

exports.index = function ( req, res ) {
    var search = req.query.search || "";
    search = "%" + search.replace( / /g, "%" ) + "%";
    models.Quiz.findAll( { where: [ "pregunta like ?", search ] } ).then( function ( quizes ) {
        res.render( 'quizes/index', { search: req.query.search, quizes: quizes } );
    } ).catch( function ( error ) {
        next( error );
    } );
}

exports.show = function ( req, res ) {
    res.render( 'quizes/show', { quiz: req.quiz } );
}

exports.answer = function ( req, res ) {
    if ( req.query.respuesta === req.quiz.respuesta ) {
        res.render( 'quizes/answer', { quiz: req.quiz, respuesta: 'Correcto' } );
    } else {
        res.render( 'quizes/answer', { quiz: req.quiz, respuesta: 'Incorrecto' } );
    }
}