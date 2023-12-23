const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')

const app = express()

const conn = require('./db/conn')

const Posts = require('./Posts')



app.use(bodyParser.json())          // to suport JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to suport URL-encoded bodies
    extended: true
}))

// esse codigo é pra usar o express com o ejs
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.use('/public', express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, '/pages'))  // pages é o nome da pasta
// fim - esse codigo é pra usar o express com o ejs


// home
// verifica se esta tendo alguma busca ou não
app.get('/', (req, res) => {

    // pra saber se o usuario esta buscando algo
    if(req.query.busca == null){
        // fazer uma requisição do banco
        Posts.find({}).sort({'_id': -1}).exec(function(err, posts){  // {} vazio vai pegar tudo, -1 é para pegar a ultima noticia para a primeira, ficar decrescente
            //console.log(posts[0])  // ele é o destaque da pagina
            posts = posts.map(function(val){  // map, fazendo um loop dentro do array
                return{
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100), // vai pegar de 0 a 100 caracteres, pra não pegar o conteudo todo
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            })



            res.render('home', {posts: posts})  // posts é o que estamos recuperando
        })
    } else{
        //res.send('Você buscou: ' +req.query.busca)
        res.render('busca', {})
    }
})

app.get('/:slug', (req, res) => {
    // slug, é o texto que aparece logo após o seu domínio como parte do link permanente que leva até o conteúdo
    // ele vai para o caminho que digitar depois do link
    //res.send(req.params.slug)
    res.render('single', {})
})

app.listen(5000, () => {
    console.log('Server rodando!')
})


// conectar ao banco de dados
/*
mongoose.connect().then(function(){
    console.log('Conectado com sucesso')
}).catch(function(err){
    console.log(err.message)
})
*/