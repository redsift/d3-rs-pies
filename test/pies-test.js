var tape = require("@redsift/tape-reel")("<div id='test'></div>"),
    d3 = require("d3-selection"),
    pies = require("../");

// This test should be on all brick compatable charts
tape("html() empty state", function(t) {
    var host = pies.html();
    var el = d3.select('#test');
    el.call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
       
    t.end();
});


tape("html() single", function(t) {
    var host = pies.html();
    var el = d3.select('#test');
    el.datum([ 1 ]).call(host);
    
    var p = el.select(host.self());
    
    t.equal(p.selectAll('path').size(), 1);
    t.equal(p.selectAll('text').size(), 1);
           
    t.end();
});

tape("html() dual", function(t) {
    var host = pies.html();
    var el = d3.select('#test');
    el.datum([ 1, 1 ]).call(host);
    
    var p = el.select(host.self());
    
    t.equal(p.selectAll('path').size(), 2);
    t.equal(p.selectAll('text').size(), 2);
           
    t.end();
});