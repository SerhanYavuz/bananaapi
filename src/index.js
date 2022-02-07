const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const rfs = require('rotating-file-stream');
const path = require('path');

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const {startDatabase} = require('./database/mongo');
const {insertBanana, getAllBananas,getBanana, updateBanana} = require('./database/bananas');

const app = express();

var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
});

app.use(helmet());
app.use(bodyParser.json())
app.use(cors());
app.use(morgan('combined', { stream: accessLogStream }));

app.get('/', async (req,res) => {
    res.send( await getAllBananas() );
});

function handleSaReq(req,res){
    res.send({message : 'as'})
}
app.get('/sa', (req,res) => handleSaReq(req,res));

const checkJwt = jwt(
    {
        secret:jwksRsa.expressJwtSecret({
            cache : true,
            rateLimit : true,
            jwksRequestsPerMinute: 20,
            jwksUri: 'http://161.35.159.65:8081/.well-known/openid-configuration/jwks'
        }),
        audience: 'potatoApi',
        issuer: 'http://161.35.159.65:8081',
        algorithms: ['RS256']
    }
);
app.use(checkJwt);

//[Route("/{parameter_name}")]
app.get('/:id', async (req,res) => {
    res.send( await getBanana(req.params.id) );
});

app.post('/', async (req,res) => {
    const newBanana = req.body;
    newBanana.isDeleted = false;
    await insertBanana(newBanana);
    res.send({message: 'Yeni muzunuz kaydedildi'});
});

//TODO güncelleme işlemi hata versede sonuç doğru gibi oluyor !
app.put('/:id', async(req,res) => {
    const bananaToBeUpdated = req.body;
    await updateBanana(req.params.id, bananaToBeUpdated);
    res.send({message: 'muzunuz güncellendi.'});
});

app.delete('/:id', async(req,res) => {
    var bananaToBeDeleted = await getBanana(req.params.id);
    if(bananaToBeDeleted == null || bananaToBeDeleted== undefined){
        res.send({message: 'öyle bi muz bulunamadı'})
    }else{
        bananaToBeDeleted.isDeleted = true
        res.send({message: 'muzunuz silindi!'});
    }

});

startDatabase().then(async () => {
    console.log('Initializing db');
    await insertBanana({name: "sait faik", origin: "ankara", owner: "245669", isDeleted:false});
    console.log('listening on port 3001');
});

app.listen(3001, () => {
    console.log('starting app');
});