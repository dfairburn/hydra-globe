import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './HydraWorld';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
  return builder
    .addBooleanSwitch({
      path: 'spin',
      name: 'Set spin',
      defaultValue: false,
    })
    .addNumberInput({
      path: 'threshold',
      name: 'Set alert threshold',
      defaultValue: 250,
    });
});
