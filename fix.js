const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/#ff3ea5/g, 'var(--pink)')
           .replace(/#fff3d6/g, 'var(--kreide)')
           .replace(/#29b6f6/g, 'var(--cyan)')
           .replace(/#7ed321/g, 'var(--gruen)')
           .replace(/#14161c/g, 'var(--grau)')
           .replace(/#20242c/g, 'var(--nacht)')
           .replace(/#3d1180/g, 'var(--lila)')
           .replace(/#120b2e/g, 'var(--nacht)')
           .replace(/#1a1040/g, 'var(--nacht)')
           .replace(/#0f2a52/g, 'var(--grau)')
           .replace(/#ffd21e/g, 'var(--gelb)')
           .replace(/#0d0d0d/g, 'var(--tinte)')
           .replace(/#ff7a18/g, 'var(--orange)')
           .replace(/#7b2ff7/g, 'var(--lila)')
           .replace(/#5a1fb8/g, 'var(--lila)')
           .replace(/#ff2e4c/g, 'var(--rot)')
           .replace(/#1ea7ff/g, 'var(--cyan)')
           .replace(/#2a2b30/g, 'var(--grau)')
           .replace(/#222327/g, 'var(--grau)')
           .replace(/#e2e2e2/g, 'var(--kreide)');
fs.writeFileSync('index.html', html, 'utf8');

let css = fs.readFileSync('css/style.css', 'utf8');
css = css.replace(/#1a1b1f/g, 'var(--nacht)')
         .replace(/#2d2e33/g, 'var(--grau)')
         .replace(/#26272b/g, 'var(--nacht)')
         .replace(/#33333d/g, 'var(--grau)')
         .replace(/#4a4a58/g, 'var(--grau)')
         .replace(/#1e1f23/g, 'var(--grau)')
         .replace(/#05060a/g, 'var(--nacht)')
         .replace(/#d2d2dc/g, 'var(--kreide)')
         .replace(/#5c5c6b/g, 'var(--tinte)')
         .replace(/#d3cabd/g, 'var(--kreide)')
         .replace(/#14141c/g, 'var(--grau)')
         .replace(/rgba\(13,13,13,.8\)/g, 'rgba(10,10,12,0.9)');
fs.writeFileSync('css/style.css', css, 'utf8');

let js = fs.readFileSync('js/game.js', 'utf8');
js = js.replace(/#0d0d0d/g, 'var(--tinte)')
       .replace(/#ffd21e/g, 'var(--gelb)')
       .replace(/#29b6f6/g, 'var(--cyan)')
       .replace(/#7b2ff7/g, 'var(--lila)')
       .replace(/#ff7a18/g, 'var(--orange)')
       .replace(/#fff3d6/g, 'var(--kreide)')
       .replace(/#f0a878/g, 'var(--haut)')
       .replace(/#7ed321/g, 'var(--gruen)')
       .replace(/#ff2e4c/g, 'var(--rot)')
       .replace(/#2a1258/g, 'var(--nacht)')
       .replace(/#3d1180/g, 'var(--lila)')
       .replace(/#120b2e/g, 'var(--nacht)')
       .replace(/#1a1040/g, 'var(--nacht)')
       .replace(/#0f2a52/g, 'var(--grau)')
       .replace(/#ff3ea5/g, 'var(--pink)')
       .replace(/#2a2b30/g, 'var(--grau)')
       .replace(/#222327/g, 'var(--grau)')
       .replace(/#e2e2e2/g, 'var(--kreide)')
       .replace(/fill=\"var\(--haut\)\"/g, 'fill=\"rgba(10,10,12,0.9)\"');
fs.writeFileSync('js/game.js', js, 'utf8');
