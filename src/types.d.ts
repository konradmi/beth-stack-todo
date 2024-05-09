// it's necessary for the inline scripting to work correctly with JSX
declare namespace JSX {
  interface HtmlTag {
    _?: string
  }
}
