class StaticHTML{
  constructor(type_, html_string) {
    this.type_ = type_
    this.html_string = html_string
  }
  genElement() {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(this.html_string, 'text/html');
    return htmlDoc.querySelector(this.type_)
  }
  genElementAndAppend(parent) {
    const elem = this.genElement()
    elem.object = elem
    parent.appendChild(elem)
    return elem
  }  
  genElementAndAttach(attachTo) {
    const elem = this.genElement()
    elem.object = attachTo
    const refs = elem.querySelectorAll("[class*='ref_']")
    refs.forEach(
      (ref) => ref.className.split(" ").forEach(
          (c) => {
            const m = c.match("ref_(.*)")
            if (m != null) {
              attachTo[m[1]] = ref
            } 
          }))
    return elem
  }
  genElementAndAttachAppend(parent, attachTo) {
    const elem = this.genElementAndAttach(attachTo)
    parent.appendChild(elem)
    return elem
  }  
}

const TAGGER = new StaticHTML("div",
  ` <div class="fillw col grey darken-3">
      <div class="col ref_tags"></div>
      <input class="col input-field ref_input"></input>
    </div>`
)
const CHIPR = new StaticHTML("div",
  `<div class="row">
<div class="chip ref_chip">
<b class="ref_text"></b>
<i class="close material-icons">close</i>
</div>
</div>`
)
const INPUT = new StaticHTML("input",
  `<input class="col input-field"></input>`
)
const TAGS = new StaticHTML("div",
  `<div class="col"></div>`
)



