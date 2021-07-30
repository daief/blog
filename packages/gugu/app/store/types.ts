import { IModuleGlobalState } from './modules/global';
import { IModuleLabelsState } from './modules/labels';

export interface IStoreState {
  global: IModuleGlobalState;
  labels: IModuleLabelsState;
}
