import { type VNode } from 'vue';

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementAttributesProperty {
      $props: any;
    }
    interface IntrinsicElements {
      [elem: string]: any;
    }
    interface IntrinsicAttributes {
      [elem: string]: any;
    }
  }
}
