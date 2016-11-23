# d3-rs-pies

[![Circle CI](https://img.shields.io/circleci/project/redsift/d3-rs-pies.svg?style=flat-square)](https://circleci.com/gh/redsift/d3-rs-pies)
[![npm](https://img.shields.io/npm/v/@redsift/d3-rs-pies.svg?style=flat-square)](https://www.npmjs.com/package/@redsift/d3-rs-pies)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/redsift/d3-rs-pies/master/LICENSE)

`d3-rs-pies` generate a range of pie charts via the D3 reusable chart convention.

## Example

[View @redsift/d3-rs-pies on Codepen](http://codepen.io/rahulpowar/pen/eBWKoB)

### Line chart

![Sample bars with a bottom orientation](https://bricks.redsift.io/reusable/d3-rs-pies.svg?_datum=[1,200,3100,1000]&orientation=bottom)

### Area chart

![Sample bars with a left orientation](https://bricks.redsift.io/reusable/d3-rs-pies.svg?_datum=[1,200,3100,1000]&orientation=left&fill=global)

### Combination

![Sample bars with a top orientation and time label](https://bricks.redsift.io/reusable/d3-rs-pies.svg?_datum=[{%22v%22:1,%22l%22:1466424812000},{%22v%22:2,%22l%22:1466511212000},{%22v%22:3,%22l%22:1466597612000},{%22v%22:300.5,%22l%22:1466684012000},{%22v%22:4000,%22l%22:1466770412000},{%22v%22:40000,%22l%22:1466856812000}]&orientation=top&labelTime=%25a%20%25d)

## Usage

### Browser
	
	<script src="//static.redsift.io/reusable/d3-rs-pies/latest/d3-rs-pies.umd-es2015.min.js"></script>
	<script>
		var chart = d3_rs_lines.html();
		d3.select('body').datum([ 1, 2, 3, 10, 100 ]).call(chart);
	</script>

### ES6

	import { chart } from "@redsift/d3-rs-pies";
	let eml = chart.html();
	...
	
### Require

	var chart = require("@redsift/d3-rs-pies");
	var eml = chart.html();
	...

### Datum

- Simplest form, array of numbers: `[1,2,3,4...]`

### Parameters

Property|Description|Transition|Preview
----|-----------|----------|-------
`classed`|*String* SVG custom class|N
`width`, `height`, `size`, `scale`|*Integer* SVG container sizes|Y
`style`|*String* Custom CSS to inject into chart|N
`outerRadius`|*Integer* Radius of the pie
`innerRadius`|*Number* > 0 the radius of the inner region in pixels. < 0, the unit inner radius as a function of the outerRadius
