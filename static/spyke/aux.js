/**
Auxilliary Functions
--------------------
Helper functions and other utilities
*/


// Color functions

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


function hexToRgba(hex, alpha) {
    r = hexToRgb(hex);
    return `rgba(${r.r},${r.g},${r.b},${alpha})`;
}


/**
Chart
-----
Helper functions for creating charts.
*/

/**
Nice number algorithm for xticks
Bumped from https://gist.github.com/igodorogea/4f42a95ea31414c3a755a8b202676dfd
*/

function niceNum (range, round) {
    var exponent = Math.floor(Math.log10(range));
    var fraction = range / Math.pow(10, exponent);
    var niceFraction;

    if (round) {
      if (fraction < 1.5) niceFraction = 1;
      else if (fraction < 3) niceFraction = 2;
      else if (fraction < 7) niceFraction = 5;
      else niceFraction = 10;
    } else {
      if (fraction <= 1) niceFraction = 1;
      else if (fraction <= 2) niceFraction = 2;
      else if (fraction <= 5) niceFraction = 5;
      else niceFraction = 10;
    }

    return niceFraction * Math.pow(10, exponent);
  }

function niceTicks(maxTick) {
    var spacing = niceNum(maxTick / 9, true);
    var steps = Math.ceil(maxTick / spacing);
    var ticks = [];
    for (var i=0; i <= steps; i++) {
        ticks.push(i * spacing);
    }
    return ticks;
}

// Chartjs legend handler

var newLegendClickHandler = function(e, legendItem) {
    var name = legendItem.text;
    var neuron = app.neurons.filter(x=>x.name==name).pop();
    var nsec = app.getSections(neuron.gid).length;

    console.log(this);

    var ci = this.chart;
    var index = legendItem.datasetIndex;
    // Loop through neuron segments
    for (var i=index; i<(index + nsec); i++){
        console.log(ci);
        var meta = ci.getDatasetMeta(i);
        console.log(meta);
        // See controller.isDatasetVisible comment
        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
    }
    // We hid a dataset ... rerender the chart
    ci.update();
};


/**
Nav Utils
-----
*/
function showMenu(e) {
  e.stopPropagation();
  el = e.target;
  console.log(el);
  let menu = el.parentElement.previousElementSibling;
  menu.classList.add('show');

  $('body').one('click', function(){
    $('.pop-menu-container').removeClass('show');
  });
}

function ToggleShowHide(el, e) {
  e.stopPropagation();
  let targetID = el.dataset.target;
  el.classList.toggle('active');
  let target = document.getElementById(targetID);
  target.classList.toggle('show');
}

/**
Data Utils
----------
*/
function getLabels(key, param) {
  return optionLabels[key].filter(x=>x.attribute==param).pop();
}

function extractParams(main, key) {
  // let out = [];
  let newObj = {};
  let old = main.map(x=>x[key] || {});
  let first = old[0] || {};
  for (var paramName in first) {
      // Keep functions
      if (typeof(first[paramName]) == "function") {
        newObj[paramName] = first[paramName];
      } else if (old.every(x=> paramName in x)){
          var val = null;
          if (old.every(x=> x[paramName] == first[paramName])) {
              val = first[paramName];
          }
          newObj[paramName] = val;
      }
  }
  return newObj;
}

function sharedKeys(arr) {
  let shared = [];
  let first = arr[0] || {};
  for (paramName in first) {
      if (arr.every(x=> paramName in x)){
        shared.push(paramName);
      }
    }
  return shared;
}
