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

  const [tipsExpanded, setTipsExpanded] = useState(false);

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
        const mappedName = axisNameMappings[axis]?.[values[axis]];
        
        // Special handling for wdth - skip if it's the default value (100)
        if (axis === 'wdth' && values[axis] === 100) {
          // Only add if there's a custom mapping that isn't the default 'Regular' or '-'
          if (mappedName && mappedName !== 'Regular' && mappedName !== '-') {
            parts.push(mappedName);
          }
        } else {
          // For all other axes (including wght)
          if (mappedName && mappedName !== '-') {
            parts.push(mappedName);
          } else if (!mappedName && axis !== 'wdth') {
            // Fallback to axis+value format, but skip for wdth when it's 100
            parts.push(`${axis}${values[axis]}`);
          }
          // If mappedName is '-', we skip adding it (unnamed default)
        }
      }
    });
    
    return parts.length > 0 ? parts.join(' ') : 'Regular';
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

    // Show hyphen tip when there are name mappings
    const hasNameMappings = Object.values(axisNameMappings).some(mapping => 
      Object.keys(mapping).length > 0
    );
    
    if (hasNameMappings && !tips.some(tip => tip.title.includes('hyphen') || tip.title.includes('default'))) {
      tips.push({
        type: 'tip',
        title: 'Default Value Naming',
        content: 'Use "-" (hyphen) to mark default values that shouldn\'t appear in style names (e.g., Regular width at 100, normal optical size). This follows the "Regular" elidable convention where default attributes are omitted from style names.'
      });
    }

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
      const styleName = getStyleName(instance);
      const axisCoords = axes.map(axis => `${axis}=${instance[axis]}`).join(' ');
      
      return {
        id: idx,
        instance,
        styleName,
        axisCoords,
        fullName: `${familyName} ${styleName}`,
        postScriptName: `${familyName.replace(/\s/g, '')}-${styleName.replace(/\s/g, '')}`,
        variableStyleName: styleName
      };
    });
  }, [familyName, axes, axisValues]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full">
        {/* Desktop Layout: Sidebar + Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Font Configuration (30% on desktop) */}
          <div className="lg:w-[30%] space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Font Configuration</h2>
                <button
                  onClick={resetToDefaults}
                  className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                >
                  Reset
                </button>
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

          {/* Contextual Tips */}
          {getContextualTips().length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setTipsExpanded(!tipsExpanded)}
                className="w-full flex items-center justify-between p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-left"
              >
                <span className="text-sm font-medium text-slate-700">
                  💡 Tips & Recommendations ({getContextualTips().length})
                </span>
                <span className="text-slate-500">
                  {tipsExpanded ? '−' : '+'}
                </span>
              </button>
              
              {tipsExpanded && (
                <div className="mt-2 space-y-2">
                  {getContextualTips().map((tip, index) => (
                    <div key={index} className={`p-3 rounded border-l-4 ${
                      tip.type === 'warning' ? 'bg-amber-50 border-amber-400' :
                      tip.type === 'info' ? 'bg-blue-50 border-blue-400' :
                      'bg-green-50 border-green-400'
                    }`}>
                      <p className={`text-xs font-semibold mb-1 ${
                        tip.type === 'warning' ? 'text-amber-700' :
                        tip.type === 'info' ? 'text-blue-700' :
                        'text-green-700'
                      }`}>{tip.title}</p>
                      <p className="text-xs text-slate-600">{tip.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                    </div>
                    <button
                      onClick={() => removeAxis(axis)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
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
                      <div className="space-y-1 max-h-32 overflow-y-auto border border-slate-200 rounded p-2 bg-white">
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
                              className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Name or -"
                            />
                            {axisNameMappings[axis]?.[value] && (
                              <button
                                onClick={() => removeAxisNameMapping(axis, value)}
                                className="text-red-400 hover:text-red-600 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        {axisValuesList.length === 0 && (
                          <p className="text-xs text-slate-400 italic text-center py-2">
                            Add axis values to configure mappings
                          </p>
                        )}
                        {axisValuesList.length > 0 && (
                          <p className="text-xs text-slate-500 mt-1 italic text-center">
                            💡 Use "-" for defaults that shouldn't appear in names
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subfamily info */}
                  {axisSubfamilies[axis] && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700">
                        <strong>Subfamily Mode:</strong> This axis will create separate font families (e.g., "MyFont Condensed", "MyFont Extended") 
                        instead of style variants within a single family. This helps organize large families in font menus.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
            </div>
          </div>

        {/* Main Content Area - Output Section (70% on desktop) */}
        <div className="lg:w-[70%]">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Generated Instances ({generateInstances.length})
            </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Axis Coordinates</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Style Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Variable Style Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Full Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">PostScript Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {generateInstances.map((instance) => (
                  <tr key={instance.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {instance.axisCoords}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {instance.styleName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {instance.variableStyleName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {instance.fullName}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {instance.postScriptName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-slate-600">
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
      </div>
    </div>
  );
};

export default GlyphsNamingCalculator;