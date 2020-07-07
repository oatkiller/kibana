/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import euiThemeAmsterdamDark from '@elastic/eui/dist/eui_theme_amsterdam_dark.json';
import euiThemeAmsterdamLight from '@elastic/eui/dist/eui_theme_amsterdam_light.json';
import { defaultTheme } from './default_theme';
import { useUiSetting } from '../../common/lib/kibana';
import { Immutable } from '../../../common/endpoint/types';

/**
 * A hook to bring Resolver theming information into components.
 */
// TODO, used interface with field-level comments
// TODO, these colors have semantic names but that might not be a good idea. for example, 'resolverEdge', which i assume is for the edge line, is also used for breadcrumb styling.
interface Colors {
  /** The color of the map background. */
  resolverBackground: string;
  /** TODO comment */
  descriptionText: string;
  /** TODO comment */
  full: string;
  /** TODO comment */
  graphControls: string;
  /** TODO comment */
  graphControlsBackground: string;
  /** TODO comment */
  resolverEdge: string;
  /** TODO comment */
  resolverEdgeText: string;
  /** TODO comment */
  processBackingFill: string;
  /** TODO comment */
  triggerBackingFill: string;
}
export const useColors = (): Immutable<Colors> => {
  const isDarkMode = useUiSetting<boolean>(defaultTheme);
  const theme = isDarkMode ? euiThemeAmsterdamDark : euiThemeAmsterdamLight;

  const getThemedOption = (lightOption: string, darkOption: string): string => {
    return isDarkMode ? darkOption : lightOption;
  };

  return {
    descriptionText: theme.euiColorDarkestShade,
    full: theme.euiColorFullShade,
    graphControls: theme.euiColorDarkestShade,
    graphControlsBackground: theme.euiColorEmptyShade,
    processBackingFill: `${theme.euiColorPrimary}${getThemedOption('0F', '1F')}`, // Add opacity 0F = 6% , 1F = 12%
    resolverBackground: theme.euiColorEmptyShade,
    resolverEdge: getThemedOption(theme.euiColorLightestShade, theme.euiColorLightShade),
    resolverEdgeText: getThemedOption(theme.euiColorDarkShade, theme.euiColorFullShade),
    triggerBackingFill: `${theme.euiColorDanger}${getThemedOption('0F', '1F')}`,
  };
};
