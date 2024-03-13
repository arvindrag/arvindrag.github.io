class StaticHTML{
  constructor(type_, html_string) {
    this.type_ = type_
    this.html_string = html_string
  }
  genElement() {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(this.html_string, 'text/html');
    return htmlDoc.querySelector("div")
  }
  genElementAndAttach(attachTo) {
    const elem = this.genElement()
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
const CARD = new StaticHTML("div",`<div class="row">
  <div class="col s12 m6">
    <div class="card waves-effect waves-light red lighten-2 ref_cardElem">
      <div class="card-content white-text">
        <p class="ref_text white-text">Goldilocks wants to make a change in her life</p>
      </div>
    </div>
  </div>
</div>`)
const EDIT_MODAL = new StaticHTML("",
`<div class="modal purple lighten-2 white-text">
  <div class="modal-content">
    <h4>And then...</h4>
    <textarea id="textarea1" class="materialize-textarea ref_textarea"></textarea>
  </div>
  <div class="modal-footer">
    <a href="#!" class="modal-close waves-effect waves-red btn-flat ref_cancelBtn">cancel</a>
    <a href="#!" class="modal-close waves-effect waves-red btn-flat ref_saveBtn">save</a>
  </div>
</div>`
)
