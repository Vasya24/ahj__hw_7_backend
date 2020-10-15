const http = require('http');
const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const uuid = require('uuid');
const app = new Koa();

const public = path.join(__dirname, '/public');
app.use(koaStatic(public));

app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');

    if(!origin) {
        return await next();
    }

    const headers = { 'Access-Control-Allow-Origin': '*', };

    if (ctx.request.method !== 'OPTIONS') {
        ctx.response.set({...headers});
        try {
            return await next();
        } catch (e) {
            e.headers = {...e.headers, ...headers};
            throw e;
        }
    }

    if (ctx.request.get('Access-Control-Request-Method')) {
        ctx.response.set({
            ...headers,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
        });

        if (ctx.request.get('Access-Control-Request-Headers')) {
            ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
          }
      
          ctx.response.status = 204;
    }
});

app.use(koaBody({
    urlencoded: true,
    multipart: true
}));

const tickets = [
    {
        id: uuid.v4(),
        name: 'Докрутить бэк',
        description: 'Нужно довести до ума бэк',
        status: false,
        created: new Date()

    },
    {
        id: uuid.v4(),
        name: 'Прикрутить фронт',
        description: 'Нужно довести до ума фронт',
        status: false,
        created: new Date()

    }
];

app.use(async ctx => {
    const { method } = ctx.request.querystring;

    switch (method) {
        case 'allTickets':
            ctx.response.body = tickets;
            return;
        // TODO: обработка остальных методов

        default:
            ctx.response.body = tickets;
            return;
    }
});


const port  = process.env.PORT || 4242;
http.createServer(app.callback()).listen(port)