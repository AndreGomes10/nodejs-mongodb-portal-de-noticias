const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const fileupload = require('express-fileupload')
const fs = require('fs')  // file system, pra trabalhar com imagem

const app = express()

const conn = require('./db/conn')

const Posts = require('./Posts')

// session
var session = require('express-session')

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 6000 }
}))
// session



app.use(bodyParser.json())          // to suport JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to suport URL-encoded bodies
    extended: true
}))


//upload de imagem
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'temp')
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

            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){  // limit ele não vai passar de 3 noticias
                // console.log(posts[0]);
                 postsTop = postsTop.map(function(val){
                         return {
                             titulo: val.titulo,
                             conteudo: val.conteudo,
                             descricaoCurta: val.conteudo.substr(0,100),
                             imagem: val.imagem,
                             slug: val.slug,
                             categoria: val.categoria,
                             views: val.views
                         }
                 })
                 res.render('home',{posts:posts,postsTop:postsTop})  // posts é o que estamos recuperando
             })
        })
    } else{

        // busca personalizada
        // regex, quando quer buscar por textos parciais, do tipo i
        Posts.find({titulo: {$regex: req.query.busca,$options:"i"}}, function(err,posts){
            console.log(posts);
            posts = posts.map(function(val){
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                    views: val.views
                }
        })
            res.render('busca',{posts:posts,contagem:posts.length})
        })
    }

})

app.get('/:slug',(req,res) => {
    // slug, é o texto que aparece logo após o seu domínio como parte do link permanente que leva até o conteúdo
    // ele vai para o caminho que digitar depois do link
    //res.send(req.params.slug)

    // fazer uma query pra achar o que eu quero e vai atualizar e recuperar ele
    Posts.findOneAndUpdate({slug: req.params.slug}, {$inc : {views: 1}}, {new: true},function(err,resposta){
        // console.log(resposta);
       if(resposta != null){

        Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){
            // console.log(posts[0]);
             postsTop = postsTop.map(function(val){
                     return {
                         titulo: val.titulo,
                         conteudo: val.conteudo,
                         //descricaoCurta: val.conteudo.substr(0,100),
                         imagem: val.imagem,
                         slug: val.slug,
                         categoria: val.categoria,
                         views: val.views
                     }
             })
             res.render('single',{noticia:resposta,postsTop:postsTop})  // vai passar as informações da noticia que vai ser a minha resposta
            })        
       }else{
           res.redirect('/');
       }
    })
})


// LOGIN  //

var usuarios = [
    {
        login: 'guilherme@gmail.com',
        senha: '123456'
    }
]

app.post('/admin/login', (req, res) => {
    usuarios.map(function(val){
        if(val.login == req.body.login && val.senha == req.body.senha){
            req.session.login = 'guilherme@gmail.com'
        }
    })
    res.redirect('/admin/login')
})

app.post('/admin/cadastro', (req, res) => {
    //console.log(req.body)
    //console.log(req.files)

    let formato = req.files.arquivo.name.split('.');
    var imagem = ""

    /* exemplo menor
    if(formato[formato.length - 1] === "JPG"){  // só quero jpg
        imagem = new Date().getTime()+'.jpg';
        req.files.arquivo.mv(__dirname+'/public/images/'+imagem);
    }else{
        fs.unlinkSync(req.files.arquivo.tempFilePath);  // pra deletar a imagem
    }
    */

    if (formato[formato.length - 1] === "JPG" || formato[formato.length - 1] === "jpg") {
        imagem = new Date().getTime() + '.jpg';
        const caminhoDestino = path.join(__dirname, 'public', 'images', imagem);

        // Garanta que o diretório de destino exista antes de mover o arquivo
        const diretorioDestino = path.dirname(caminhoDestino);
        if (!fs.existsSync(diretorioDestino)) {
            fs.mkdirSync(diretorioDestino, { recursive: true });
        }

        req.files.arquivo.mv(caminhoDestino, (err) => {
            if (err) {
                return res.status(500).send(err);
            }
        });
    } else {
        fs.unlinkSync(req.files.arquivo.tempFilePath);
    }

    Posts.create({
        titulo: req.body.titulo_noticia,
        //imagem: req.body.url_imagem,  // url externa
        imagem: 'http://localhost:5000/public/images/'+imagem,
        categoria: "Nenhuma",
        conteudo: req.body.noticia,
        slug: req.body.slug,
        views: 0,
        autor: "Admin"
    })
    res.redirect('/admin/login')
    //res.send("Cadastro com sucesso!")
})

app.get('/admin/login', (req, res) => {
    if(req.session.login == null){  // se não estiver logado
        res.render('admin-login')
    }else{  // se estiver logado
        Posts.find({}).sort({'_id': -1}).exec(function(err,posts){  // limit ele não vai passar de 3 noticias
            // console.log(posts[0]);
            posts = posts.map(function(val){
                    return {
                        id: val._id,
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        //descricaoCurta: val.conteudo.substr(0,100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria
                    }
            })
            res.render('admin-panel',{posts:posts})
        })
    }
})

// LOGIN  //

// deletar
app.get('/admin/deletar/:id', (req, res) => {
    Posts.deleteOne({_id: req.params.id}).then(function(){
        res.redirect('/admin/login')
    })
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