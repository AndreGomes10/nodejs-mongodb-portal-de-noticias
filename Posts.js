var mongoose = require('mongoose')
//var Schema = mongoose.Schema;

const { Schema } = mongoose

const Posts = mongoose.model(  // vai inserir o schema dentro
  'Posts',
  new Schema({
    titulo: {
      type: String,
      required: true,
    },
    imagem: {
      type: String,
      required: true,
    },
    categoria: {
      type: String,
      required: true,
    },
    conteudo: {
      type: String,
      required: true,
    },
    slug: {
        type: String,
        required: true,
      },
      autor: {
        type: String,
        required: true,
      },
      views: {
        type: Number,
        required: true,
      },
  }, {colletction: 'posts'}),
)

module.exports = Posts



/*
var postSchema = new Schema({
    titulo: String,
    imagem: String,
    categoria: String,
    conteudo: String,
    slug: String,
    autor: String,
    views: Number
}, {collection: 'posts'})

var Posts = mongoose.model('Posts', postSchema)

module.exports = Posts
*/
