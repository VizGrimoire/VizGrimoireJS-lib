VizGrimoireJS-lib is the javascript library used by [VizGrimoreJS](https://github.com/VizGrimoire/VizGrimoireJS)
dashboard to visualize its widgets content.

It manages data loading from `browser/data/json` (mainly with `src/Loader.js`), 
and data biding based on the VizGrimoireJS dashboard markup.

Demo: http://demo.bitergia.com/

# Dependecies

Currently, it depends on:
- JQuery
- Flotr2
- Bootstrap

There is some _deprecated_ code including dependecies like:
- Gridster
- Envision

# How to use it?

Main code is under `src` folder. To create a new version of the library just:

<pre><code>$ make</code></pre>

Created library should be put on `brower/lib` directory in [VizGrimoreJS](https://github.com/VizGrimoire/VizGrimoireJS)




