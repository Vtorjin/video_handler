/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}


interface Window {
  DPlayer: any
}

declare namespace JSFile {
  export interface Add {
    name: string,
    href: string,
    icon: string,
    belong: string,
    suffix: string,
    js: string,
    isDynamic: boolean
    origin: string
    pathname: string
    startId: number
  }
  type PasteKeys = Pick<Add, 'icon' | 'href' | 'origin' | 'pathname' | 'js'>


  export interface JSEdit extends Add {
    id: string
  }

  export interface TagsForm {
    id: string,
    host: string,
    actor: string,
    type: string,
    area: string,
    age: string
  }
}