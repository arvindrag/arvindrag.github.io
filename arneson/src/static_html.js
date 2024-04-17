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
const CRUMB = new StaticHTML("a", `<a href="#!" class="breadcrumb ref_name"></a>`)
const CARDS_SET = new StaticHTML("div", `<div class="cardsset col s3"></div>`)
const CARD = new StaticHTML("div",
`<div class="row s12">
    <div class="card waves-effect waves-light red lighten-2 ref_cardElem">
      <div class="card-content white-text">
        <p class="ref_text white-text"></p>
      </div>
    </div>
</div>`)
const ACTIVE_TAGS = new StaticHTML("div",
`<div class="card grey darken-3">
  <div class="card-content white-text">
    <div class="ref_tags white-text col"></div>
  </div>
</div>`)
const EDIT_TEXT_MODAL = new StaticHTML("div",
`<div class="modal purple lighten-2 white-text">
  <div class="modal-content">
    <h6>And then...</h6>
    <textarea id="textarea" class="materialize-textarea ref_textarea"></textarea>
  </div>
  <div class="modal-footer">
    <a href="#!" class="modal-close waves-effect waves-red btn-flat ref_cancelBtn">cancel</a>
    <a href="#!" class="modal-close waves-effect waves-red btn-flat ref_saveBtn">save</a>
  </div>
</div>`)
const EDIT_TAGS_MODAL = new StaticHTML("div",
`<div class="modal purple lighten-2 white-text">
  <div class="modal-content">
    <h6>#tags</h6>
    <div class="ref_chipsElem chips chips-placeholder"></div>
  </div>
  <div class="modal-footer">
    <a href="#!" class="modal-close waves-effect waves-red btn-flat ref_cancelBtn">cancel</a>
    <a href="#!" class="modal-close waves-effect waves-red btn-flat ref_saveBtn">save</a>
  </div>
</div>`)
