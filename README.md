VizGrimoireJS-lib is the javascript library used by [VizGrimoreJS](https://github.com/VizGrimoire/VizGrimoireJS)
dashboard to visualize its widgets content.

It manages data loading from `browser/data/json` (mainly with `src/DataSources.js` and `src/Loader.js`), 
and data biding based on the VizGrimoireJS dashboard markup (mainly with `src/Convert.js`and `src/HTMLComposer.js`).

Demo: http://demo.bitergia.com/

# Dependecies

Currently, it _depends_ on:
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




