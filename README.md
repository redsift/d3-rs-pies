# d3-rs-pies

[![Circle CI](https://img.shields.io/circleci/project/redsift/d3-rs-pies.svg?style=flat-square)](https://circleci.com/gh/redsift/d3-rs-pies)
[![npm](https://img.shields.io/npm/v/@redsift/d3-rs-pies.svg?style=flat-square)](https://www.npmjs.com/package/@redsift/d3-rs-pies)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/redsift/d3-rs-pies/master/LICENSE)

`d3-rs-pies` generate a range of pie charts via the D3 reusable chart convention.

## Example

[View @redsift/d3-rs-pies on Codepen](http://codepen.io/rahulpowar/pen/eBWKoB)

### Simple pie chart

![Simple pie chart](https://bricks.redsift.cloud/reusable/d3-rs-pies.svg?_datum=%5B%7B%22l%22%3A%22(direct)%22%2C%22v%22%3A108%7D%2C%7B%22l%22%3A%22google%22%2C%22v%22%3A105%7D%2C%7B%22l%22%3A%22crunchbase.com%22%2C%22v%22%3A19%7D%2C%7B%22l%22%3A%22techcrunch.com%22%2C%22v%22%3A16%7D%2C%7B%22l%22%3A%22Others%22%2C%22v%22%3A77%7D%5D)

### Pie chart with legend

![With legend](https://bricks.redsift.cloud/reusable/d3-rs-pies.svg?_datum=[20,200,3100,1000]&legend=20&legend=200)

### Inner radius and padded

![Inner radius](https://bricks.redsift.cloud/reusable/d3-rs-pies.svg?_datum=[1,4,6,2,8,9,7,6,4]&innerRadius=-0.2&padAngle=0.05)

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
