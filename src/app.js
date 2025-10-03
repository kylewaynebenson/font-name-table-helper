import React, { useState, useMemo, useEffect } from 'react';
import { Info, Plus, X, Calculator } from 'lucide-react';

const GlyphsNamingCalculator = () => {
  // Load initial state from localStorage or use defaults
  const [familyName, setFamilyName] = useState(() => {
    const saved = localStorage.getItem('fontHelper_familyName');
    return saved ? JSON.parse(saved) : 'MyFont';
  });
  
  const [axes, setAxes] = useState(() => {
    const saved = localStorage.getItem('fontHelper_axes');
    return saved ? JSON.parse(saved) : ['wght', 'wdth'];
  });
  
  const [axisValues, setAxisValues] = useState(() => {
    const saved = localStorage.getItem('fontHelper_axisValues');
    return saved ? JSON.parse(saved) : {
      wght: '100,200,300,400,500,600,700,800,900',
      wdth: '75,100,125'
    };
  });
  
  const [axisNameMappings, setAxisNameMappings] = useState(() => {
    const saved = localStorage.getItem('fontHelper_axisNameMappings');
    return saved ? JSON.parse(saved) : {
      wght: {
        100: 'Thin',
        200: 'ExtraLight',
        250: 'UltraLight',
        275: 'Light',
        300: 'Light',
        350: 'SemiLight',
        400: 'Regular',
        450: 'Book',
        500: 'Medium',
        600: 'SemiBold',
        650: 'DemiBold',
        700: 'Bold',
        800: 'ExtraBold',
        850: 'Heavy',
        900: 'Black',
        950: 'ExtraBlack'
      },
      wdth: {
        50: 'UltraCondensed',
        62.5: 'ExtraCondensed',
        75: 'Condensed',
        87.5: 'SemiCondensed',
        100: '-',
        112.5: 'SemiExtended',
        125: 'Extended',
        150: 'ExtraExtended',
        200: 'UltraExtended'
      },
      opsz: {
        8: 'UI',
        18: '-',
        36: 'Deck',
        72: 'Display'
      }
    };
  });

  const [axisSubfamilies, setAxisSubfamilies] = useState(() => {
    const saved = localStorage.getItem('fontHelper_axisSubfamilies');
    return saved ? JSON.parse(saved) : {};
  });

  const [axisRegularElidable, setAxisRegularElidable] = useState(() => {
    const saved = localStorage.getItem('fontHelper_axisRegularElidable');
    return saved ? JSON.parse(saved) : {};
  });

  const [showTipsConsole, setShowTipsConsole] = useState(false);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('fontHelper_familyName', JSON.stringify(familyName));
  }, [familyName]);

  useEffect(() => {
    localStorage.setItem('fontHelper_axes', JSON.stringify(axes));
  }, [axes]);

  useEffect(() => {
    localStorage.setItem('fontHelper_axisValues', JSON.stringify(axisValues));
  }, [axisValues]);

  useEffect(() => {
    localStorage.setItem('fontHelper_axisNameMappings', JSON.stringify(axisNameMappings));
  }, [axisNameMappings]);

  useEffect(() => {
    localStorage.setItem('fontHelper_axisSubfamilies', JSON.stringify(axisSubfamilies));
  }, [axisSubfamilies]);

  useEffect(() => {
    localStorage.setItem('fontHelper_axisRegularElidable', JSON.stringify(axisRegularElidable));
  }, [axisRegularElidable]);

  const commonAxes = {
    wght: { name: 'Weight', default: '100,200,300,400,500,600,700,800,900' },
    wdth: { name: 'Width', default: '75,100,125' },
    opsz: { name: 'Optical Size', default: '8,18,36,72' },
    ital: { name: 'Italic', default: '0,1' },
    slnt: { name: 'Slant', default: '-15,0' },
  };

  const removeAxis = (axis) => {
    setAxes(axes.filter(a => a !== axis));
    const newValues = { ...axisValues };
    delete newValues[axis];
    setAxisValues(newValues);
    // Optionally remove name mappings too
    const newMappings = { ...axisNameMappings };
    delete newMappings[axis];
    setAxisNameMappings(newMappings);
  };

  const getStyleName = (values) => {
    const parts = [];
    
    // Process axes in the order they appear in the axes array
    axes.forEach(axis => {
      if (values[axis] !== undefined) {
        // Skip axes that are set to subfamily mode
        if (axisSubfamilies[axis]) {
          return;
        }
        
        const mappedName = axisNameMappings[axis]?.[values[axis]];
        
        // Special handling for wdth - skip if it's the default value (100)
        if (axis === 'wdth' && values[axis] === 100) {
          // Only add if there's a custom mapping that isn't the default 'Regular' or '-'
          if (mappedName && mappedName !== 'Regular' && mappedName !== '-') {
            parts.push(mappedName);
          } else if (mappedName === 'Regular' && !axisRegularElidable['wght']) {
            // Add "Regular" only if Regular elidable is not enabled
            parts.push(mappedName);
          }
        } else {
          // For all other axes (including wght)
          if (mappedName && mappedName !== '-') {
            // Special handling: skip "Regular" from any axis if "Consider Regular elidable" is checked for wght
            if (mappedName === 'Regular' && axisRegularElidable['wght']) {
              // Skip adding "Regular" when elidable option is enabled
            } else {
              parts.push(mappedName);
            }
          } else if (!mappedName && axis !== 'wdth') {
            // Fallback to axis+value format, but skip for wdth when it's 100
            parts.push(`${axis}${values[axis]}`);
          }
          // If mappedName is '-', we skip adding it (unnamed default)
        }
      }
    });
    
    // Style Name should never be empty - always fall back to 'Regular'
    return parts.length > 0 ? parts.join(' ') : 'Regular';
  };

  const getFamilyName = (values) => {
    const familyParts = [familyName];
    
    // Process axes in the order they appear in the axes array
    axes.forEach(axis => {
      if (values[axis] !== undefined && axisSubfamilies[axis]) {
        const mappedName = axisNameMappings[axis]?.[values[axis]];
        
        // Special handling for wdth - skip if it's the default value (100)
        if (axis === 'wdth' && values[axis] === 100) {
          // Only add if there's a custom mapping that isn't the default 'Regular' or '-'
          if (mappedName && mappedName !== 'Regular' && mappedName !== '-') {
            familyParts.push(mappedName);
          } else if (mappedName === 'Regular' && !axisRegularElidable['wght']) {
            // Add "Regular" only if Regular elidable is not enabled
            familyParts.push(mappedName);
          }
        } else {
          // For all other axes
          if (mappedName && mappedName !== '-') {
            // Special handling: skip "Regular" from any axis if "Consider Regular elidable" is checked for wght
            if (mappedName === 'Regular' && axisRegularElidable['wght']) {
              // Skip adding "Regular" when elidable option is enabled
            } else {
              familyParts.push(mappedName);
            }
          } else if (!mappedName && axis !== 'wdth') {
            // Fallback to axis+value format, but skip for wdth when it's 100
            familyParts.push(`${axis}${values[axis]}`);
          }
        }
      }
    });
    
    return familyParts.join(' ');
  };

  const getVariableStyleName = (values) => {
    const parts = [];
    
    // For variable style name, include ALL axes regardless of subfamily settings
    axes.forEach(axis => {
      if (values[axis] !== undefined) {
        const mappedName = axisNameMappings[axis]?.[values[axis]];
        
        // Special handling for wdth - skip if it's the default value (100)
        if (axis === 'wdth' && values[axis] === 100) {
          // Only add if there's a custom mapping that isn't the default 'Regular' or '-'
          if (mappedName && mappedName !== 'Regular' && mappedName !== '-') {
            parts.push(mappedName);
          } else if (mappedName === 'Regular' && !axisRegularElidable['wght']) {
            // Add "Regular" only if Regular elidable is not enabled
            parts.push(mappedName);
          }
        } else {
          // For all other axes (including wght)
          if (mappedName && mappedName !== '-') {
            // Special handling: skip "Regular" from any axis if "Consider Regular elidable" is checked for wght
            if (mappedName === 'Regular' && axisRegularElidable['wght']) {
              // Skip adding "Regular" when elidable option is enabled
            } else {
              parts.push(mappedName);
            }
          } else if (!mappedName && axis !== 'wdth') {
            // Fallback to axis+value format, but skip for wdth when it's 100
            parts.push(`${axis}${values[axis]}`);
          }
          // If mappedName is '-', we skip adding it (unnamed default)
        }
      }
    });
    
    // If no parts remain and Regular elidable is enabled, return empty string instead of 'Regular'
    if (parts.length === 0) {
      return axisRegularElidable['wght'] ? '' : 'Regular';
    }
    return parts.join(' ');
  };

  const updateAxisNameMapping = (axis, value, name) => {
    setAxisNameMappings(prev => ({
      ...prev,
      [axis]: {
        ...prev[axis],
        [value]: name
      }
    }));
  };

  const removeAxisNameMapping = (axis, value) => {
    setAxisNameMappings(prev => {
      const newMappings = { ...prev };
      if (newMappings[axis]) {
        delete newMappings[axis][value];
      }
      return newMappings;
    });
  };

  const toggleAxisSubfamily = (axis) => {
    setAxisSubfamilies(prev => ({
      ...prev,
      [axis]: !prev[axis]
    }));
  };

  const toggleAxisRegularElidable = (axis) => {
    setAxisRegularElidable(prev => ({
      ...prev,
      [axis]: !prev[axis]
    }));
  };

  const copyAsGlyphsInstances = () => {
    // Format instances for Glyphs app property list format
    const glyphsFormat = `{
instances = (
${generateInstances.map(instance => {
  const axesValues = axes.map(axis => instance.instance[axis]).join(',\n');
  const axisLocation = axes.map(axis => {
    const axisName = commonAxes[axis]?.name || axis;
    return `{
Axis = "${axisName}";
Location = ${instance.instance[axis]};
}`;
  }).join(',\n');

  return `{
axesValues = (
${axesValues}
);
customParameters = (
{
name = "Axis Location";
value = (
${axisLocation}
);
}
);
name = "${instance.styleName}";
properties = (
{
key = familyNames;
values = (
{
language = dflt;
value = "${instance.familyName}";
}
);
},
{
key = variableStyleNames;
values = (
{
language = dflt;
value = "${instance.variableStyleName}";
}
);
},
{
key = WWSFamilyName;
value = "${instance.familyName}";
},
{
key = WWSSubfamilyName;
value = "${instance.styleName}";
}
);
}`;
}).join(',\n')}
);
}`;
    
    navigator.clipboard.writeText(glyphsFormat).then(() => {
      // You could add a toast notification here if desired
      console.log('Copied to clipboard as Glyphs instances format');
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  };

  const getContextualTips = () => {
    const tips = [];
    
    // Always show basic naming information when starting out
    if (axes.length <= 2 && familyName === 'MyFont') {
      tips.push({
        type: 'info',
        title: 'Font Naming Overview',
        content: `Variable Style Name is used for static instances, Style Name appears in font menus, PostScript Name has no spaces (hyphen-separated), and Full Name includes the complete family name. Use "-" for default values that shouldn't appear in style names.`
      });
    }

    // Check axis order
    const idealOrder = ['wdth', 'wght', 'opsz', 'ital', 'slnt'];
    const currentOrder = axes.filter(axis => idealOrder.includes(axis));
    const isIdealOrder = currentOrder.every((axis, index) => {
      const idealIndex = idealOrder.indexOf(axis);
      const previousAxes = currentOrder.slice(0, index);
      return previousAxes.every(prevAxis => idealOrder.indexOf(prevAxis) < idealIndex);
    });

    if (!isIdealOrder && axes.length > 1) {
      tips.push({
        type: 'warning',
        title: 'Axis Order Convention',
        content: `Consider reordering axes to follow Adobe's recommended sequence: Width → Weight → Optical Size → Italic → Slant. Your current order (${axes.join(', ')}) will affect the generated style names. The typical order ensures better compatibility across applications.`
      });
    }

    // Check for italic at start
    if (axes[0] === 'ital') {
      tips.push({
        type: 'info',
        title: 'Italic First',
        content: 'Having Italic as the first axis is unusual. Typically, Italic comes after Weight and Width in style names (e.g., "Bold Italic" not "Italic Bold"). Consider moving it later in the sequence unless you have a specific design reason.'
      });
    }

    // Check for proper width naming
    if (axes.includes('wdth') && axisNameMappings.wdth?.[100] !== '-') {
      tips.push({
        type: 'tip',
        title: 'Width Naming Convention',
        content: 'The default width value (100) is typically unnamed in style names. Consider using a hyphen (-) for the 100 value to indicate it should be omitted from style names, following the "Regular" elidable convention. Width axis uses 100 as normal, with condensed values below and extended above.'
      });
    }

    // Check for weight axis conventions
    if (axes.includes('wght')) {
      const wghtValues = axisValues.wght ? axisValues.wght.split(',').map(v => parseFloat(v.trim())) : [];
      const hasStandardWeights = wghtValues.some(v => v % 100 === 0 && v >= 100 && v <= 900);
      
      if (wghtValues.length > 0 && !hasStandardWeights) {
        tips.push({
          type: 'tip',
          title: 'Weight Axis Convention',
          content: 'Weight axis typically uses values 100-900 in increments of 100 (100=Thin, 400=Regular, 700=Bold, 900=Black). Consider using standard weight values for better compatibility with design applications.'
        });
      }
    }

    // Check for large families
    const totalInstances = axes.reduce((total, axis) => {
      const values = axisValues[axis] ? axisValues[axis].split(',').length : 1;
      return total * values;
    }, 1);

    if (totalInstances > 16) {
      tips.push({
        type: 'warning',
        title: 'Large Font Family',
        content: `Your configuration generates ${totalInstances} instances. For families this large, consider using Typographic Family Names (Name ID 16) to create subfamilies. For example, separate "MyFont Condensed" and "MyFont Extended" into different submenus rather than one large menu. Use the "Split into subfamilies" checkbox on relevant axes.`
      });
    }

    // Check for optical size without proper naming
    if (axes.includes('opsz')) {
      const opszValues = axisValues.opsz ? axisValues.opsz.split(',').map(v => parseFloat(v.trim())) : [];
      const hasDisplaySizes = opszValues.some(v => v >= 72);
      const hasTextSizes = opszValues.some(v => v <= 18);
      
      if (hasDisplaySizes && hasTextSizes) {
        tips.push({
          type: 'info',
          title: 'Optical Size Naming',
          content: 'You have both text and display optical sizes. Consider using descriptive names like "Caption" (8-12pt), "Text" (14-18pt), "Subhead" (24-36pt), and "Display" (48pt+) to help users choose the right size for their use case.'
        });
      }
    }

    // Show hyphen tip when width 100 has a name or all opsz values have names
    const width100HasName = axisNameMappings.wdth?.[100] && axisNameMappings.wdth[100] !== '-';
    const opszValues = axes.includes('opsz') && axisValues.opsz 
      ? axisValues.opsz.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
      : [];
    const allOpszHaveNames = opszValues.length > 0 && opszValues.every(value => 
      axisNameMappings.opsz?.[value] && axisNameMappings.opsz[value] !== ''
    );
    
    if (width100HasName || allOpszHaveNames) {
      tips.push({
        type: 'tip',
        title: 'Default Value Naming',
        content: 'Use "-" (hyphen) to mark default values that shouldn\'t appear in style names (e.g., Regular width at 100, normal optical size). This follows the "Regular" elidable convention where default attributes are omitted from style names.'
      });
    }

    // Show subfamily tips for axes that are set to split into subfamilies
    Object.keys(axisSubfamilies).forEach(axis => {
      if (axisSubfamilies[axis] && axes.includes(axis)) {
        tips.push({
          type: 'info',
          title: `${axis.toUpperCase()} Subfamily Mode`,
          content: `The ${axis} axis will create separate font families (e.g., "MyFont Condensed", "MyFont Extended") instead of style variants within a single family. This helps organize large families in font menus and follows Adobe's recommended subfamily approach.`
        });
      }
    });

    return tips;
  };

  const handleAxesOrderChange = (axesString) => {
    const newAxes = axesString.split(',').map(axis => axis.trim()).filter(axis => axis.length > 0);
    
    // Add default values for any new axes that don't have them
    const newAxisValues = { ...axisValues };
    const newAxisMappings = { ...axisNameMappings };
    
    newAxes.forEach(axis => {
      if (!newAxisValues[axis]) {
        newAxisValues[axis] = commonAxes[axis]?.default || '0,100';
      }
      if (!newAxisMappings[axis]) {
        newAxisMappings[axis] = {};
        // Add default mappings for known axes
        if (axis === 'wght') {
          newAxisMappings[axis] = {
            100: 'Thin', 200: 'ExtraLight', 250: 'UltraLight', 275: 'Light', 300: 'Light',
            350: 'SemiLight', 400: 'Regular', 450: 'Book', 500: 'Medium', 600: 'SemiBold',
            650: 'DemiBold', 700: 'Bold', 800: 'ExtraBold', 850: 'Heavy', 900: 'Black', 950: 'ExtraBlack'
          };
        } else if (axis === 'wdth') {
          newAxisMappings[axis] = {
            50: 'UltraCondensed', 62.5: 'ExtraCondensed', 75: 'Condensed', 87.5: 'SemiCondensed',
            100: '-', 112.5: 'SemiExtended', 125: 'Extended', 150: 'ExtraExtended', 200: 'UltraExtended'
          };
        } else if (axis === 'opsz') {
          newAxisMappings[axis] = {
            8: 'UI', 18: '-', 36: 'Deck', 72: 'Display'
          };
        }
      }
    });
    
    setAxes(newAxes);
    setAxisValues(newAxisValues);
    setAxisNameMappings(newAxisMappings);
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This will clear all your custom configurations.')) {
      localStorage.clear();
      setFamilyName('MyFont');
      setAxes(['wght', 'wdth']);
      setAxisValues({
        wght: '100,200,300,400,500,600,700,800,900',
        wdth: '75,100,125'
      });
      setAxisNameMappings({
        wght: {
          100: 'Thin',
          200: 'ExtraLight',
          250: 'UltraLight',
          275: 'Light',
          300: 'Light',
          350: 'SemiLight',
          400: 'Regular',
          450: 'Book',
          500: 'Medium',
          600: 'SemiBold',
          650: 'DemiBold',
          700: 'Bold',
          800: 'ExtraBold',
          850: 'Heavy',
          900: 'Black',
          950: 'ExtraBlack'
        },
        wdth: {
          50: 'UltraCondensed',
          62.5: 'ExtraCondensed',
          75: 'Condensed',
          87.5: 'SemiCondensed',
          100: '-',
          112.5: 'SemiExtended',
          125: 'Extended',
          150: 'ExtraExtended',
          200: 'UltraExtended'
        },
        opsz: {
          8: 'UI',
          18: '-',
          36: 'Deck',
          72: 'Display'
        }
      });
      setAxisSubfamilies({});
      setAxisRegularElidable({});
    }
    
    setAxes(newAxes);
    setAxisValues(newAxisValues);
    setAxisNameMappings(newAxisMappings);
  };

  const generateInstances = useMemo(() => {
    const instances = [];
    
    const parseValues = (valueString) => {
      return valueString.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    };

    const axisValueArrays = axes.map(axis => ({
      axis,
      values: parseValues(axisValues[axis] || '0,100')
    }));

    const generateCombinations = (arrays, current = {}, index = 0) => {
      if (index === arrays.length) {
        instances.push({ ...current });
        return;
      }
      
      arrays[index].values.forEach(value => {
        generateCombinations(arrays, { ...current, [arrays[index].axis]: value }, index + 1);
      });
    };

    generateCombinations(axisValueArrays);
    
    return instances.map((instance, idx) => {
      const familyName = getFamilyName(instance);
      const styleName = getStyleName(instance);
      const variableStyleName = getVariableStyleName(instance);
      const axisCoords = axes.map(axis => `${axis}=${instance[axis]}`).join(' ');
      
      return {
        id: idx,
        instance,
        familyName,
        styleName,
        variableStyleName,
        axisCoords,
        fullName: `${familyName} ${styleName}`,
        postScriptName: `${familyName.replace(/\s/g, '')}-${styleName.replace(/\s/g, '')}`
      };
    });
  }, [familyName, axes, axisValues, axisNameMappings, axisSubfamilies, axisRegularElidable]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full relative">
        {/* Desktop Layout: Sidebar + Main Content + Tips Console */}
        <div className="flex flex-col lg:flex-row gap-0 transition-all duration-300">
          {/* Left Sidebar - Font Configuration (30% on desktop) */}
          <div className="space-y-6 'lg:w-[30%] lg:h-screen lg:overflow-y-auto">
            <div className="bg-white border-r border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Font Configuration</h2>
                <div className="flex items-center gap-2">
                  {getContextualTips().length > 0 && (
                    <button
                      onClick={() => setShowTipsConsole(!showTipsConsole)}
                      className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                        showTipsConsole 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      <span className="w-2 h-2 bg-current rounded-full"></span>
                      Tips ({getContextualTips().length})
                    </button>
                  )}
                  <button
                    onClick={resetToDefaults}
                    className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
          
          {/* Family Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Family Name
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="MyFont"
            />
          </div>

          {/* Axes Order */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Axes Order (comma-separated)
            </label>
            <input
              type="text"
              value={axes.join(', ')}
              onChange={(e) => handleAxesOrderChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="wght, wdth, opsz"
            />
            <p className="text-xs text-slate-500 mt-1">
              Define the order of axes for naming. Common axes: wght, wdth, opsz, ital, slnt
            </p>
          </div>

          {/* Axes Configuration */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Variable Font Axes
            </label>
            
            {axes.map(axis => {
              const axisValuesList = axisValues[axis] ? axisValues[axis].split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v)) : [];
              
              return (
                <div key={axis} className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-slate-700">{axis}</span>
                      {commonAxes[axis] && (
                        <span className="text-xs text-slate-500">({commonAxes[axis].name})</span>
                      )}
                      {/* Subfamily checkbox for axes that typically create subfamilies */}
                      {(axis === 'wdth' || axis === 'opsz') && (
                        <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={axisSubfamilies[axis] || false}
                            onChange={() => toggleAxisSubfamily(axis)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          Split into subfamilies
                        </label>
                      )}
                      {/* Regular elidable checkbox for weight axis */}
                      {axis === 'wght' && (
                        <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={axisRegularElidable[axis] || false}
                            onChange={() => toggleAxisRegularElidable(axis)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          Consider Regular elidable
                        </label>
                      )}
                    </div>
                  </div>
                  
                  {/* 50/50 Layout for Axis Values and Name Mappings */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Axis Values Input */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Axis Values
                      </label>
                      <input
                        type="text"
                        value={axisValues[axis] || ''}
                        onChange={(e) => setAxisValues({ ...axisValues, [axis]: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="100,200,300,400,500"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Comma-separated values
                      </p>
                    </div>

                    {/* Name Mappings */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Value → Name Mappings
                      </label>
                      <div className="space-y-2">
                        {axisValuesList.map(value => (
                          <div key={value} className="flex gap-2 items-center">
                            <span className="text-xs font-mono text-slate-600 w-10 flex-shrink-0">
                              {value}
                            </span>
                            <span className="text-xs text-slate-400">→</span>
                            <input
                              type="text"
                              value={axisNameMappings[axis]?.[value] || ''}
                              onChange={(e) => updateAxisNameMapping(axis, value, e.target.value)}
                              className="flex-1 px-2 py-1 text-xs w-full border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Name or -"
                            />
                          </div>
                        ))}
                        {axisValuesList.length === 0 && (
                          <p className="text-xs text-slate-400 italic text-center py-2">
                            Add axis values to configure mappings
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          </div>

        {/* Main Content Area - Output Section (adjusts based on console) */}
        <div className="lg:w-[70%] lg:h-screen lg:overflow-y-auto">
          <div className="bg-white p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b-2 border-slate-200 z-10">
                <tr>
                  <th className="px-2 py-1 text-left font-semibold text-slate-700">Axis Coordinates</th>
                  <th className="px-2 py-1 text-left font-semibold text-slate-700">Family Name</th>
                  <th className="px-2 py-1 text-left font-semibold text-slate-700">Style Name</th>
                  <th className="px-2 py-1 text-left font-semibold text-slate-700">Variable Style Name</th>
                  <th className="px-2 py-1 text-left font-semibold text-slate-700">Full Name</th>
                  <th className="px-2 py-1 text-left font-semibold text-slate-700">PostScript Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {generateInstances.map((instance) => (
                  <tr key={instance.id} className="hover:bg-slate-50">
                    <td className="px-2 py-1 font-mono text-xs text-slate-600">
                      {instance.axisCoords}
                    </td>
                    <td className="px-2 py-1 text-slate-700">
                      {instance.familyName}
                    </td>
                    <td className="px-2 py-1 text-slate-700">
                      {instance.styleName}
                    </td>
                    <td className="px-2 py-1 text-slate-700">
                      {instance.variableStyleName}
                    </td>
                    <td className="px-2 py-1 text-slate-700">
                      {instance.fullName}
                    </td>
                    <td className="px-2 py-1 font-mono text-xs text-slate-600">
                      {instance.postScriptName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Copy as Glyphs Instances Button */}
          {generateInstances.length > 0 && (
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={copyAsGlyphsInstances}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy as Glyphs Instances
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-6 text-center text-sm text-slate-600">
          <p>
            Based on Glyphs app naming conventions. For more details, visit{' '}
            <a 
              href="https://glyphsapp.com/learn/naming" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              glyphsapp.com/learn/naming
            </a>
          </p>
        </div>
          </div>
        </div>

        {/* Tips Console - Fixed Right Panel */}
        {showTipsConsole && (
          <div className="fixed top-6 right-6 bottom-6 w-80 bg-slate-900 text-slate-100 rounded-lg shadow-2xl border border-slate-700 flex flex-col z-50">
            {/* Console Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm font-mono">Tips Console</span>
                <span className="text-xs text-slate-400">({getContextualTips().length})</span>
              </div>
              <button
                onClick={() => setShowTipsConsole(false)}
                className="text-slate-400 hover:text-slate-200 text-lg"
              >
                ×
              </button>
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
              {getContextualTips().map((tip, index) => (
                <div key={index} className="border-l-2 border-slate-600 pl-3">
                  <div className={`text-xs uppercase tracking-wide mb-1 ${
                    tip.type === 'warning' ? 'text-yellow-400' :
                    tip.type === 'info' ? 'text-blue-400' :
                    'text-green-400'
                  }`}>
                    [{tip.type}] {tip.title}
                  </div>
                  <div className="text-slate-300 text-xs leading-relaxed">
                    {tip.content}
                  </div>
                </div>
              ))}
              
              {getContextualTips().length === 0 && (
                <div className="text-slate-500 text-center py-8">
                  <div className="text-2xl mb-2">◯</div>
                  <div>No tips available</div>
                  <div className="text-xs">Configure your font to see recommendations</div>
                </div>
              )}
            </div>

            {/* Console Footer */}
            <div className="p-3 border-t border-slate-700 text-xs text-slate-500">
              Based on Glyphs naming conventions
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlyphsNamingCalculator;