
import { select } from 'd3-selection';
import { arc, pie } from 'd3-shape';
import { format, formatDefaultLocale } from 'd3-format';

import { html as svg } from '@redsift/d3-rs-svg';
import { units } from "@redsift/d3-rs-intl";
import { tip } from "@redsift/d3-rs-tip";
import { 
  contrasts as contrasts,
  presentation10 as presentation10,
  display as display
} from '@redsift/d3-rs-theme';

const DEFAULT_SIZE = 270;
const DEFAULT_ASPECT = 1;
const DEFAULT_MARGIN = 12;  // white space
const DEFAULT_INSET = 0;   // scale space
const DEFAULT_LEGEND_SIZE = 10;
const DEFAULT_LEGEND_PADDING_X = 8;
const DEFAULT_LEGEND_PADDING_Y = 24;
const DEFAULT_LEGEND_TEXT_SCALE = 8; // hack value to do fast estimation of length of string
const DEFAULT_CORNER_RADIUS = 3;
const DEFAULT_TICK_FORMAT_VALUE = ',.0f';
const DEFAULT_TICK_FORMAT_VALUE_SI = '.2s';
const DEFAULT_TICK_FORMAT_VALUE_SMALL = '.3f';

// Font fallback chosen to keep presentation on places like GitHub where Content Security Policy prevents inline SRC
const DEFAULT_STYLE = [ "@import url(https://fonts.googleapis.com/css?family=Source+Code+Pro:300);",
                        "text{ font-family: 'Source Code Pro', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-weight: 300; }",
                        ".legend text { font-size: 12px }"
                      ].join(' \n');

export default function pies(id) {
  let classed = 'chart-pies', 
      theme = 'light',
      background = null,
      width = DEFAULT_SIZE,
      height = null,
      margin = DEFAULT_MARGIN,
      style = DEFAULT_STYLE,
      scale = 1.0,
      inset = DEFAULT_INSET,
      language = null,
      displayTip = -1,
      legend = [ ],
      fill = null,
      displayValue = null,
      displayFormatValue = null,
      innerRadius = 0,
      outerRadius = null,
      startAngle = 0,
      endAngle = 2 * Math.PI,
      padAngle = 0,
      cornerRadius = null,
      value = function (d) {
        if (Array.isArray(d)) {
          return d;
        }
        if (typeof d === 'object') {
          return d.v;
        }

        return d;
      };

    
  function _coerceArray(d) {
    if (d == null) {
      return [];
    }
    
    if (!Array.isArray(d)) {
        return [ d ];
    }
    
    return d;
  }
 
  function _makeFillFn() {
    let colors = () => fill;
    if (fill == null) {
      let c = presentation10.standard;
      colors = (d, i) => (c[i % c.length]);
    } else if (typeof fill === 'function') {
      colors = fill;
    } else if (Array.isArray(fill)) {
      colors = (d, i) => fill[ i % fill.length ];
    }
    return colors;  
  }  
  
  function _impl(context) {
    let selection = context.selection ? context.selection() : context,
        transition = (context.selection !== undefined);
   
    formatDefaultLocale(units(language).d3);
    
    let defaultValueFormat = format(DEFAULT_TICK_FORMAT_VALUE);
    let defaultValueFormatSi = format(DEFAULT_TICK_FORMAT_VALUE_SI);
    let defaultValueFormatSmall = format(DEFAULT_TICK_FORMAT_VALUE_SMALL);  

    let displayFn = displayValue;
    if (displayFn == null) {
      if (displayFormatValue != null) {
        let fn = format(displayFormatValue);
        displayFn = (i) => fn(i); 
      } else {
        displayFn = function (i) {
          if (i === 0.0) {
            return defaultValueFormat(i);
          } else if (i > 9999 || i <= 0.001) {
            return defaultValueFormatSi(i);  
          } else if (i < 1) {
            return defaultValueFormatSmall(i);  
          } else {
            return defaultValueFormat(i);
          }
        }
      }
    }
       
    selection.each(function() {
      let node = select(this);  
      let sh = height || Math.round(width * DEFAULT_ASPECT);
      
      // SVG element
      let sid = null;
      if (id) sid = 'svg-' + id;
      let root = svg(sid).width(width).height(sh).margin(margin).scale(scale);
      let tnode = node;
      if (transition === true) {
        tnode = node.transition(context);
      }
      tnode.call(root);
      
      let elmSVG = node.select(root.self());
      let elmD = elmSVG.select('defs');

      let elmS = elmSVG.select(root.child());

      // Tip
      let tid = null;
      if (id) tid = 'tip-' + id;
      let rtip = tip(tid).html((d) => d);
      let st = style + ' ' + rtip.style();
      rtip.style(st);
      elmS.call(rtip);
    
      // Create required elements
      let g = elmS.select(_impl.self())
      if (g.empty()) {
        g = elmS.append('g').attr('class', classed).attr('id', id);
        g.append('g').attr('class', 'legend');
        g.append('g').attr('class', 'pie');
      
        elmD.append('path').attr('id', 'text-outer');
        elmD.append('path').attr('id', 'text-inner');
      }

      let data = g.datum() || [ 1 ];
      
      let vdata = data.map((d, i) => value(d, i));
      
      g.datum(vdata); // this rebind is required even though there is a following select
                       
      let w = root.childWidth(),
          h = root.childHeight();
      
      // Create the legend
      if (legend.length > 0) {
        h = h - (DEFAULT_LEGEND_SIZE + DEFAULT_LEGEND_PADDING_Y);
        let rg = g.select('g.legend');
        let lg = rg.attr('transform', 'translate(' + (w/2) + ',' + (h + DEFAULT_LEGEND_PADDING_Y) + ')').selectAll('g').data(legend);
        lg.exit().remove();
        let newlg = lg.enter().append('g');
        
        let colors = _makeFillFn();

        newlg.append('rect')
              .attr('width', DEFAULT_LEGEND_SIZE)
              .attr('height', DEFAULT_LEGEND_SIZE)
              .attr('fill', colors);

        newlg.append('text')
          .attr('dominant-baseline', 'central')
          .attr('y', DEFAULT_LEGEND_SIZE / 2)
          .attr('x', () => DEFAULT_LEGEND_SIZE + DEFAULT_LEGEND_PADDING_X);
              
        lg = newlg.merge(lg);

        lg.selectAll('text').text((d) => d);

        let lens = legend.map((s) => s.length * DEFAULT_LEGEND_TEXT_SCALE + DEFAULT_LEGEND_SIZE + 2 * DEFAULT_LEGEND_PADDING_X);
        let clens = []
        let total = lens.reduce((p, c) => (clens.push(p) , p + c), 0);
        
        let offset = -total / 2;
        rg.selectAll('g').data(clens).attr('transform', (d) => 'translate(' + (offset + d) + ',0)');
      }            
      
      let colors = _makeFillFn();
      
      let radius = outerRadius;
      if (radius == null) {
        radius = (Math.min(w, h) - 2 * inset) / 2;
      }
      let inner = innerRadius;
      if (inner < 0.0) {
        inner = (1 + inner) * radius;
      }
      let arcs = arc()
            .innerRadius(inner)
            .outerRadius(radius)
            .cornerRadius(cornerRadius !== null ? cornerRadius : (padAngle > 0.0 ? DEFAULT_CORNER_RADIUS : 0));
      
      let piel = pie().sortValues(null).sort(null)
                    .padAngle(padAngle)
                    .startAngle(startAngle)
                    .endAngle(endAngle); // TODO: Support?
      
      let centerX = w / 2;          
      let pies = g.select('g.pie')
                  .attr('transform', 'translate(' + centerX + ',' + (radius + inset) + ')')
                  .selectAll('g.slice').data(piel(vdata));  
      pies.exit().remove();
      let newSlices = pies.enter().append('g').attr('class', 'slice');
      newSlices.append('path');
      newSlices.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'middle');
      
      pies = newSlices.merge(pies);
      
      let paths = pies.selectAll('path').data(d => [ d ]);
      paths.attr('d', arcs).attr('fill', d => colors(d.data, d.index));

      let texts = pies.selectAll('text').data(d => [ d ]);
      texts.attr('transform', function(d) { 
                d.innerRadius = inner;
                d.outerRadius = outerRadius;
                return 'translate(' + arcs.centroid(d) + ')';        
            })
            .attr('fill', d => contrasts.white(colors(d.data, d.index)) ? display.text.white : display.text.black )
            .text(function (d) {
              let label = data[d.index].l || displayFn(d.value);
              if (d.endAngle - d.startAngle < 0.1) return null; //TODO: smarter threshold for this
              return label;
            });
    });
    
  }
  
  _impl.self = function() { return 'g' + (id ?  '#' + id : '.' + classed); }

  _impl.id = function() {
    return id;
  };
    
  _impl.classed = function(value) {
    return arguments.length ? (classed = value, _impl) : classed;
  };
    
  _impl.background = function(value) {
    return arguments.length ? (background = value, _impl) : background;
  };

  _impl.theme = function(value) {
    return arguments.length ? (theme = value, _impl) : theme;
  };  

  _impl.size = function(value) {
    return arguments.length ? (width = value, height = null, _impl) : width;
  };
    
  _impl.width = function(value) {
    return arguments.length ? (width = value, _impl) : width;
  };  

  _impl.height = function(value) {
    return arguments.length ? (height = value, _impl) : height;
  }; 

  _impl.scale = function(value) {
    return arguments.length ? (scale = value, _impl) : scale;
  }; 

  _impl.margin = function(value) {
    return arguments.length ? (margin = value, _impl) : margin;
  };   

  _impl.inset = function(value) {
    return arguments.length ? (inset = value, _impl) : inset;
  };  

  _impl.style = function(value) {
    return arguments.length ? (style = value, _impl) : style;
  }; 
  
  _impl.value = function(valuep) {
    return arguments.length ? (value = valuep, _impl) : value;
  };
  
  _impl.language = function(value) {
    return arguments.length ? (language = value, _impl) : language;
  };   
  
  _impl.legend = function(value) {
    return arguments.length ? (legend = _coerceArray(value), _impl) : legend;
  }; 
   
  _impl.displayTip = function(value) {
    return arguments.length ? (displayTip = value, _impl) : displayTip;
  };   
  
  _impl.fill = function(value) {
    return arguments.length ? (fill = value, _impl) : fill;
  };    

  _impl.startAngle = function(value) {
    return arguments.length ? (startAngle = value, _impl) : startAngle;
  };  
  
  _impl.endAngle = function(value) {
    return arguments.length ? (endAngle = value, _impl) : endAngle;
  };    

  _impl.padAngle = function(value) {
    return arguments.length ? (padAngle = value, _impl) : padAngle;
  };    

  _impl.cornerRadius = function(value) {
    return arguments.length ? (cornerRadius = value, _impl) : cornerRadius;
  };        
      
  _impl.outerRadius = function(value) {
    return arguments.length ? (outerRadius = value, _impl) : outerRadius;
  };    

  _impl.innerRadius = function(value) {
    return arguments.length ? (innerRadius = value, _impl) : innerRadius;
  };    
  
  _impl.displayValue = function(value) {
    return arguments.length ? (displayValue = value, _impl) : displayValue;
  }; 
  
  _impl.displayFormatValue = function(value) {
    return arguments.length ? (displayFormatValue = value, _impl) : displayFormatValue;
  };     
              
  return _impl;
}