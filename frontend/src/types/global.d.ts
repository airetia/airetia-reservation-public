// frontend/src/types/global.d.ts
// CSS Modules の型宣言
// → 05_frontend_specification.md §7 スタイリング

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.svg' {
  import React from 'react'
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  export default ReactComponent
}

declare module '*.png' {
  const src: string
  export default src
}
