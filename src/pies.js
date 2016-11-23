
import { select } from 'd3-selection';
import { arc, pie } from 'd3-shape';
import { format, formatDefaultLocale } from 'd3-format';
import { timeFormatLocale } from 'd3-time-format';
import { interpolate } from 'd3-interpolate'

import { html as svg } from '@redsift/d3-rs-svg';
import { svg as legends } from '@redsift/d3-rs-legends';
import { units, time } from "@redsift/d3-rs-intl";
import { body as tip } from "@redsift/d3-rs-tip";
import { 
  contrasts,
  presentation10,
  display,
  fonts
} from '@redsift/d3-rs-theme';

const DEFAULT_SIZE = 270;
const DEFAULT_ASPECT = 1;
const DEFAULT_MARGIN = 12;  // white space
const DEFAULT_INSET = 8;   // scale space
const DEFAULT_CORNER_RADIUS = 3;
const DEFAULT_TICK_FORMAT_VALUE = ',.0f';
const DEFAULT_TICK_FORMAT_VALUE_SI = '.2s';
const DEFAULT_TICK_FORMAT_VALUE_SMALL = '.3f';

export default function pies(id) {
  let classed = 'chart-pies', 
      theme = 'light',
      background = null,
      width = DEFAULT_SIZE,
      height = null,
      margin = DEFAULT_MARGIN,
      style = undefined,
      scale = 1.0,
      inset = DEFAULT_INSET,
      language = null,
      displayTip = -1,
      legend = [ ],
      legendOrientation = 'bottom',
      fill = null,
      displayValue = null,
      displayFormatValue = null,
      innerRadius = 0,
      outerRadius = null,
      startAngle = 0,
      endAngle = 2 * Math.PI,
      padAngle = 0,
      cornerRadius = null,
      labelTime = null,
      tipHtml = undefined,
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
    
    let _label = labelTime;
    if (_label == null) {
      _label = x => x;
    } else if (typeof labelTime === 'function') {
        // noop      
    } else {
      let localeTime = time(language).d3;
      let tf = timeFormatLocale(localeTime);
      _label = tf.format(labelTime);          
    }
    
    let _tipHtml = tipHtml;
    if (_tipHtml === undefined) {
      _tipHtml = d => d;
    }
       
    selection.each(function() {
      let node = select(this);  
      let sh = height || Math.round(width * DEFAULT_ASPECT);
      
      let lchart = null;
      if (legend.length > 0) {
        lchart = legends();
      }
            
      // SVG element
      let sid = null;
      if (id) sid = 'svg-' + id;
      let root = svg(sid).width(width).height(sh).margin(margin).scale(scale);

      let tid = null;
      if (id) tid = 'tip-' + id;
      let rtip = tip(tid).theme(theme).html(_tipHtml).style(null);

      let _style = style,
          w = root.childWidth(),
          h = root.childHeight();
      
      if (_style === undefined) {
        _style = _impl.defaultStyle(w, theme);

        _style += rtip.defaultStyle(theme);
        
        if (lchart != null) {
          _style += lchart.defaultStyle(w, theme);
        }
      }
      root.style(_style);

      let tnode = node;
      if (transition === true) {
        tnode = node.transition(context);
      }
      tnode.call(root);
      
      let elmSVG = node.select(root.self());
      elmSVG.call(rtip);
      let elmD = elmSVG.select('defs');

      let elmS = elmSVG.select(root.child());

      let _inset = inset;
      if (_inset == null) {
        _inset = { top: DEFAULT_INSET, bottom: DEFAULT_INSET, left: DEFAULT_INSET, right: DEFAULT_INSET };
      } else if (typeof _inset === 'object') {
        _inset = { top: _inset.top, bottom: _inset.bottom, left: _inset.left, right: _inset.right };
      } else {
        _inset = { top: _inset, bottom: _inset, left: _inset, right: _inset };
      }  
    
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
                       
      let solo = vdata.length < 2;

      let colors = _makeFillFn();

      // Create the legend
      if (lchart != null) {
        lchart = lchart.width(w).height(h).inset(0).fill(colors).theme(theme).orientation(legendOrientation);

        _inset = lchart.childInset(_inset);

        elmS.datum(legend).call(lchart);
      }
      
      let radius = outerRadius;
      if (radius == null) {
        radius = Math.min(w - (_inset.left + _inset.right), h - (_inset.top + _inset.bottom)) / 2;
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
      let pdata = piel(vdata);
      
      let pies = g.select('g.pie')
                  .attr('transform', 'translate(' + centerX + ',' + (radius + _inset.top) + ')');
                  
      let slicesPaths = pies.select('g.slices');
      if (slicesPaths.empty()) {
        slicesPaths = pies.append('g').attr('class', 'slices');
      }        
      let paths = slicesPaths.selectAll('path').data(pdata);  
      paths.exit().remove();
      paths = paths.enter().append('path').merge(paths);

      paths.attr('pointer-events', 'all')
            .on('mouseover', function (d) {
              rtip.show.apply(this, [ d.data, d.index ]);
            })
            .on('mouseout', rtip.hide);
          
      let texts = pies.selectAll('text').data(pdata);  
      texts.exit().remove();
      texts = texts.enter()
            .append('text')
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('pointer-events', 'none')
            .merge(texts);
         
      if (transition === true) {
        paths = paths.transition(context);
        texts = texts.transition(context);
      }
            
      paths.attr('fill', d => colors(d.data, d.index));
      rtip.hide();
      
      function tweenPie(b) {
        let previous = this._previous || { startAngle: startAngle, endAngle: endAngle };

        let i = interpolate(previous, b);
        this._previous = b;
        
        return t => arcs(i(t));
      }
            
      if (paths.attrTween) {
        paths.attrTween('d', tweenPie);
      } else {
        paths.attr('d', arcs).each(function(d) { this._previous = d; });
      }
      
      texts.attr('transform', function(d) { 
        if (solo) {
          return 'translate(0,0)';   
        } else {
          d.innerRadius = inner;
          d.outerRadius = outerRadius;
          return `translate(${arcs.centroid(d)})`;   
        }     
      })
      .attr('fill', d => contrasts.white(colors(d.data, d.index)) ? display.dark.text : display.light.text)
      .text(function (d) {
        let label = data[d.index].l || displayFn(d.value);
        if (d.endAngle - d.startAngle < 0.3) return null; //TODO: smarter threshold for this
        return _label(label);
      });
    });
    
  }
  
  _impl.self = function() { return 'g' + (id ?  '#' + id : '.' + classed); }

  _impl.id = function() {
    return id;
  };
  
  _impl.defaultStyle = (_width) => `
                  ${fonts.fixed.cssImport}
                  
                  ${_impl.self()} g.pie text { 
                      font-family: ${fonts.fixed.family};
                      font-size: ${fonts.fixed.sizeForWidth(_width)};     
                      font-weight: ${fonts.fixed.weightMonochrome};      
                       
                    }
  `;
    
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

  _impl.legendOrientation = function(value) {
    return arguments.length ? (legendOrientation = value, _impl) : legendOrientation;
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
  
  _impl.labelTime = function(value) {
    return arguments.length ? (labelTime = value, _impl) : labelTime;
  };   
  
  _impl.tipHtml = function(value) {
    return arguments.length ? (tipHtml = value, _impl) : tipHtml;
  };   
              
  return _impl;
}