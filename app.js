const util = require('util'),
  rss = require('rss-to-json').parse,
  express = require('express'),
  {NodeHtmlMarkdown} = require('node-html-markdown'),
  app = express();

const svbtle = 'http://betacar.net/feed';

function parseArticle({id, title, description, content, created, link}) {
  const slug = id.split(':Post/')[1],
    html = content ? NodeHtmlMarkdown.translate(content) : null,
    publishedOn = new Date(created);

  return {
    slug, title, publishedOn,
    link, description,
    content: html
  };
}

function getRSSFeed() {
  return rss(svbtle)
    .then(response => response.items.map(parseArticle));
}

function handleError (res, err, data) {
  res.status(500).send();
}

app.use(function (req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/posts', async function (req, res) {
  const articles = await getRSSFeed()
  res.json(articles);
});

app.get('/posts/latest', async function (req, res) {
  const article = await getRSSFeed().then(articles => articles[0]);
  res.json(article);
});

app.get('/posts/:slug', async function (req, res) {
  const article = await getRSSFeed().then(articles => articles.find(article => article.slug === req.params.slug));
  res.json(article);
});

app.get('/ping', function (req, res) {
  res.send('pong');
});

app.listen(process.env.PORT);
