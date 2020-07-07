/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import euiThemeAmsterdamDark from '@elastic/eui/dist/eui_theme_amsterdam_dark.json';
import euiThemeAmsterdamLight from '@elastic/eui/dist/eui_theme_amsterdam_light.json';
import { ButtonColor } from '@elastic/eui/src/components/button/button';
import { useUiSetting } from '../../common/lib/kibana';
import { svgSymbolIDs } from './svg_singletons';
import { useColors } from './use_colors';
import { defaultTheme } from './default_theme';

export function useCubeAssets(
  isProcessTerminated: boolean
): {
  backingFill: string;
  cubeSymbol: string;
  descriptionFill: string;
  isLabelFilled: boolean;
  labelButtonFill: ButtonColor;
  strokeColor: string;
} {
  const isDarkMode = useUiSetting<boolean>(defaultTheme);
  const theme = isDarkMode ? euiThemeAmsterdamDark : euiThemeAmsterdamLight;
  const colorMap = useColors();

  if (isProcessTerminated) {
    return {
      backingFill: colorMap.processBackingFill,
      cubeSymbol: `#${svgSymbolIDs.terminatedProcessCube}`,
      descriptionFill: colorMap.descriptionText,
      isLabelFilled: false,
      labelButtonFill: 'primary',
      strokeColor: `${theme.euiColorPrimary}33`, // 33 = 20% opacity
    };
  } else {
    return {
      backingFill: colorMap.processBackingFill,
      cubeSymbol: `#${svgSymbolIDs.runningProcessCube}`,
      descriptionFill: colorMap.descriptionText,
      isLabelFilled: true,
      labelButtonFill: 'primary',
      strokeColor: theme.euiColorPrimary,
    };
  }
}
