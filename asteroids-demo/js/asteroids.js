'use strict';

var _immutableQuadtrees = require('immutable-quadtrees');

var _immutableQuadtrees2 = _interopRequireDefault(_immutableQuadtrees);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function boundary(x, y, width, height) {
  return (0, _immutable.Map)({ x: x, y: y, width: width, height: height });
}

function moving(direction, velocity) {
  var rad = direction * Math.PI / 180;

  var dx = velocity * Math.cos(rad);
  var dy = velocity * Math.sin(rad);

  return (0, _immutable.Map)({ dx: dx, dy: dy });
}

function asteroid(x, y, w, h, d, v) {
  return boundary(x, y, w, h).merge(moving(d, v)).merge({ color: '#8B4513' });
}

function item(x, y, w, h, color) {
  return boundary(x, y, w, h).merge({ color: color });
}

function move(item, bound) {
  var dx = item.get('dx');
  var dy = item.get('dy');

  if (item.get('x') + dx <= bound.get('x') + item.get('width') || item.get('x') + dx >= bound.get('x') + bound.get('width') - item.get('width')) {
    dx = -1 * dx;
  }

  if (item.get('y') + dy <= bound.get('y') + item.get('height') || item.get('y') + dy >= bound.get('y') + bound.get('height') - item.get('height')) {
    dy = -1 * dy;
  }

  return item.update('x', function (x) {
    return x + dx;
  }).update('y', function (y) {
    return y + dy;
  }).set('dx', dx).set('dy', dy);
}

function generateBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function range(n) {
  return Array.apply(null, { length: n }).map(Number.call, Number);
}

function generateMap(quadtree, items) {
  var temp = _immutableQuadtrees2.default.clear(quadtree);

  return _immutableQuadtrees2.default.batchInsert(temp, items);
}

function viewport(p, w, h) {
  return boundary(p.get('x') - Math.floor(w / 2), p.get('y') - Math.floor(h / 2), w, h);
}

function shootAsteroid(asteroids, cannon) {
  if (asteroids.length > 30) {
    return asteroids;
  }

  var direction = generateBetween(0, 359);
  var velocity = generateBetween(2, 5);
  var size = generateBetween(Math.ceil(cannon.get('width') / 2), cannon.get('width'));
  return asteroids.concat(asteroid(cannon.get('x'), cannon.get('y'), size, size, direction, velocity));
}

function drawMap(context, items, width, height) {
  context.fillStyle = '#000000';
  context.fillRect(0, 0, width, height);

  items.map(function (item) {
    context.beginPath();
    context.arc(item.get('x'), item.get('y'), item.get('width'), 0, Math.PI * 2);
    context.fillStyle = item.get('color');
    context.fill();
    context.closePath();
  });
}

function draw() {
  var items = [cannon].concat(asteroids);
  drawMap(context, items, width, height);
  requestAnimationFrame(draw);
}

var width = 600;
var height = 600;
var tileSize = 16;
var field = boundary(0, 0, width, height);

var cannon = item((width - tileSize) / 2, (height - tileSize) / 2, tileSize, tileSize, '#778899');

var quadtree = _immutableQuadtrees2.default.create(field);

var stage = viewport(cannon, width, height);

var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var asteroids = shootAsteroid([], cannon);

setInterval(function () {
  asteroids = shootAsteroid(asteroids, cannon);
}, 2000);

setInterval(function () {
  asteroids = asteroids.map(function (item) {
    return move(item, field, quadtree);
  });

  quadtree = _immutableQuadtrees2.default.clear(quadtree);
  quadtree = _immutableQuadtrees2.default.batchInsert(quadtree, [cannon].concat(asteroids));

  asteroids = asteroids.map(function (a) {
    if (_immutableQuadtrees2.default.search(quadtree, a).count() > 1) {
      console.log('collision detected');
      return a.set('color', '#FF0000');
    }

    return a.set('color', '#8B4513');
  });
}, 100);

requestAnimationFrame(draw);