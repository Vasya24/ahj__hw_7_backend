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

const date = new Date();

const tickets = [
    {
        id: 0,
        name: 'Докрутить бэк',
        description: 'Нужно довести до ума бэк',
        status: false,
        created: `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} ровно в ${date.getHours()}:${date.getMinutes()}`
    },
    {
        id: 1,
        name: 'Прикрутить фронт',
        description: 'Нужно довести до ума фронт',
        status: false,
        created: `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} ровно в ${date.getHours()}:${date.getMinutes()}`
    }
];

class TicketFull {
    constructor(name, description) {
      this.id = uuid.v4();
      this.name = name;
      this.description = description;
      this.status = false;
      this.created = date;
    }
  }

  app.use(async (ctx) => {
    const { id, method, status } = ctx.request.query;
    const { editId, name, description } = ctx.request.body;
    let item;

    switch (method) {
      case 'allTickets':
        ctx.response.body = tickets;
        return;
      case 'createTicket':
        tickets.push(new TicketFull(name, description));
        ctx.response.body = tickets;
        return;
      case 'editTicket':
        item = tickets.findIndex((item) => item.id === editId);
          tickets[item].name = name;
          tickets[item].description = description;
          ctx.response.body = 'ok';
          return;
      case 'ticketById':
        const ticket = tickets.filter((item) => item.id === id);
        ctx.response.body = ticket[0].description;
        return;
      case 'toggleStatus':
        item = tickets.findIndex((item) => item.id === id);
        tickets[item].status = status === 'true' ? true : false;
        ctx.response.body = 'ok';
        return;
      case 'deleteTicket':
        tickets = tickets.filter((item) => item.id !== id);
        ctx.response.body = 'ok';
        return;
      default:
        ctx.response.status = 404;
    }
  });


const port  = process.env.PORT || 4242;
http.createServer(app.callback()).listen(port)