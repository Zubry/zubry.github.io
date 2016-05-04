'use strict';

var _immutableQuadtrees = require('immutable-quadtrees');

var _immutableQuadtrees2 = _interopRequireDefault(_immutableQuadtrees);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function boundary(x, y, width, height) {
  return (0, _immutable.Map)({ x: x, y: y, width: width, height: height });
}

function colored(color) {
  return (0, _immutable.Map)({ color: color });
}

function ranged(x, y, w, h) {
  return (0, _immutable.Map)({ range: boundary(x - w, y - h, 2 * w, 2 * h) });
}

function goblin(x, y) {
  return boundary(x, y, 1, 1).merge(colored('#b1c686')).merge(ranged(x, y, 12, 12));
}

function cow(x, y) {
  return boundary(x, y, 1, 2).merge(colored('#675246')).merge(ranged(x, y, 8, 8));
}

function player(x, y) {
  return boundary(x, y, 1, 1).merge(colored('#FFFFFF'));
}

function hans(x, y) {
  return boundary(x, y, 1, 1).merge(colored('#f5df0d')).merge(ranged(x, y, 5, 5));
}

function move(npc) {
  var bound = npc.get('range');
  var dx = Math.round(Math.random() * 2 - 1);
  var dy = Math.round(Math.random() * 2 - 1);

  if (npc.get('x') + dx < bound.get('x') || npc.get('x') + dx > bound.get('x') + bound.get('width')) {
    dx = -1 * dx;
  }

  if (npc.get('y') + dy < bound.get('y') || npc.get('y') + dy > bound.get('y') + bound.get('height')) {
    dy = -1 * dy;
  }

  return npc.update('x', function (x) {
    return x + dx;
  }).update('y', function (y) {
    return y + dy;
  });
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

function absoluteToRelativeCoords(item, view) {
  return (0, _immutable.Map)({
    x: item.get('x') - view.get('x'),
    y: item.get('y') - view.get('y')
  });
}

function drawMap(context, creatures, width, height, tileSize, view) {
  // 73be51
  context.fillStyle = '#73be51';
  context.fillRect(0, 0, width, height);

  creatures.map(function (creature) {
    var coords = absoluteToRelativeCoords(creature, view);

    context.fillStyle = creature.get('color');
    context.fillRect((coords.get('x') - 1) * tileSize, (coords.get('y') - 1) * tileSize, creature.get('width') * tileSize, creature.get('height') * tileSize);
  });
}

var width = 192;
var height = 128;

var cows = range(50).map(function () {
  return cow(generateBetween(0, width), generateBetween(0, height));
});
var goblins = range(70).map(function () {
  return goblin(generateBetween(0, width), generateBetween(0, height));
});
var Hans = hans(width / 2 - 3, height / 2 - 5);
var Player = player(width / 2, height / 2);

var quadtree = _immutableQuadtrees2.default.create(boundary(0, 0, width, height));

var stage = viewport(Player, 48, 32);

var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

setInterval(function () {
  cows = cows.map(function (c) {
    return move(c);
  });
  goblins = goblins.map(function (g) {
    return move(g);
  });
  Hans = move(Hans);

  var gameobjects = cows.concat(goblins).concat(Hans).concat(Player);
  quadtree = generateMap(quadtree, gameobjects);

  var items = _immutableQuadtrees2.default.search(quadtree, stage);
  console.log(items.toJS());

  drawMap(context, items, 768, 512, 16, stage);
}, 600);