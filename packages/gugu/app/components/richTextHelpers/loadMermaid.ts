import { IOption } from './type';

const linkSvg = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M582.826667 687.217778a9.187556 9.187556 0 0 0-12.913778 0l-132.807111 132.835555c-61.468444 61.44-165.262222 67.982222-233.130667 0-67.982222-68.010667-61.496889-171.690667 0-233.159111l132.807111-132.807111a9.159111 9.159111 0 0 0 0-12.913778l-45.511111-45.511111a9.187556 9.187556 0 0 0-12.885333 0l-132.807111 132.835556c-96.711111 96.682667-96.711111 253.155556 0 349.696 96.711111 96.568889 253.155556 96.711111 349.724444 0l132.778667-132.778667a9.187556 9.187556 0 0 0 0-12.913778l-45.226667-45.283555zM878.364444 145.521778c-96.682667-96.711111-253.155556-96.711111-349.696 0l-132.920888 132.807111a9.159111 9.159111 0 0 0 0 12.913778l45.368888 45.368889c3.555556 3.527111 9.386667 3.527111 12.913778 0l132.807111-132.835556c61.496889-61.44 165.262222-67.982222 233.130667 0 68.010667 68.039111 61.496889 171.690667 0 233.159111l-132.778667 132.835556a9.187556 9.187556 0 0 0 0 12.885333l45.482667 45.511111c3.527111 3.527111 9.386667 3.527111 12.913778 0l132.807111-132.835555a247.409778 247.409778 0 0 0 0-349.809778z m-254.293333 206.734222a9.187556 9.187556 0 0 0-12.885333 0l-258.844445 258.730667a9.159111 9.159111 0 0 0 0 12.913777l45.226667 45.283556c3.555556 3.527111 9.386667 3.527111 12.913778 0l258.759111-258.759111a9.187556 9.187556 0 0 0 0-12.913778l-45.141333-45.226667z" p-id="1668"></path></svg>`;

// mermaid 绘图
export function loadMermaid({ root, disabledAnchor }: IOption) {
  if (import.meta.env.SSR || !root.value) return;

  import('mermaid/dist/mermaid.min.js').then((mermaid) => {
    Array.from(root.value.querySelectorAll('.mermaid')).forEach((graph) => {
      mermaid.init(void 0, graph);
    });
  });

  Array.from(root.value.querySelectorAll('a.headerlink')).forEach((it) => {
    it.innerHTML = disabledAnchor ? '' : linkSvg;
  });
}