class Card {
  constructor(parent, text, tags) {
    this.elem = CARD.genElementAndAttach(this);
    this.elem.card = this;
    this.parent = parent;
    this.tags = tags;
    this.setText(text);
    this.cardElem.addEventListener("click", () => {
      this.setFocus();
    });
    this.cardElem.addEventListener("dblclick", () => {
      this.edit();
    });
  }
  static genAppend(parent, text, tags) {
    const card = new Card(parent, text, tags);
    parent.elem.appendChild(card.elem);
    card.setFocus();
    return card;
  }
  genAfter(parent, text) {
    const card = new Card(parent, text, this.tags.slice(0));
    this.elem.after(card.elem);
    card.setFocus();
    return card;
  }
  setText(text) {
    this.text.innerHTML = text;
  }
  getText(text) {
    return this.text.innerHTML
  }  
  unFocus() {
    if (this.cardElem.classList.contains("purple")) {
      this.cardElem.classList.remove("purple");
    }
    if (!this.cardElem.classList.contains("red")) {
      this.cardElem.classList.add("red");
    }
  }
  setFocus() {
    if (this.parent.curFocus != null) {
      this.parent.curFocus.unFocus();
    }
    this.parent.curFocus = this;
    this.parent.updateTags(this.tags);
    if (this.cardElem.classList.contains("red")) {
      this.cardElem.classList.remove("red");
    }
    if (!this.cardElem.classList.contains("purple")) {
      this.cardElem.classList.add("purple");
    }
  }
  focusNext() {
    if (this.elem.nextSibling != null && "card" in this.elem.nextSibling) {
      this.elem.nextSibling.card.setFocus();
    }
  }
  focusPrevious() {
    if (this.elem.previousSibling && "card" in this.elem.previousSibling) {
      this.elem.previousSibling.card.setFocus();
    }
  }
  edit() {
    this.parent.editTextModal.open(this.text.innerHTML, (txt) => {
      this.text.innerHTML = txt;
    });
  }
  editTags() {
    this.parent.editTagsModal.open(this.tags, (tags) => {
      this.tags = tags;
      this.setFocus();
    });
  }
}
class EditTagsModal {
  constructor(parent) {
    this.elem = EDIT_TAGS_MODAL.genElementAndAttachAppend(parent, this);
    this.instance = M.Modal.init(this.elem);
    this.textElemRef = null;
    this.saveBtn.addEventListener("click", () => {
      this.doSave();
    });
  }
  doSave() {
    console.log(this.chipsElem.querySelector(".input"));
    this.onSaveCallBack(
      this.chips.chipsData.map((d) => {
        return d.tag;
      })
    );
    this.instance.close();
    this.onSaveCallBack = null;
  }
  open(init_tags, callback) {
    this.chips = M.Chips.init(this.chipsElem, {
      data: init_tags.map((t) => {
        return { tag: t };
      }),
    });
    this.onSaveCallBack = callback;
    this.instance.open();
    const input = this.chipsElem.querySelector(".input");
    input.focus();
  }
}
class EditTextModal {
  constructor(parent) {
    this.elem = EDIT_TEXT_MODAL.genElementAndAttachAppend(parent, this);
    this.instance = M.Modal.init(this.elem);
    this.textElemRef = null;
    this.saveBtn.addEventListener("click", () => this.doSave());
  }
  doSave() {
    if (!this.textarea.value == "") {
      this.onSaveCallBack(this.textarea.value);
    }
    this.onSaveCallBack = null;
  }
  open(init_text, callback) {
    this.textarea.value = init_text;
    this.onSaveCallBack = callback;
    this.instance.open();
    this.textarea.focus();
    this.textarea.select();
  }
}
class CardsSet {
  constructor(tree, parent_elem, parent_card = null) {
    this.tree = tree
    this.elem = CARDS_SET.genElementAndAttach();
    this.elem.cardsSet = this;
    this.curFocus = null;
    this.child = null
    this.parent_card = parent_card
    this.editTextModal = new EditTextModal(parent_elem);
    this.editTagsModal = new EditTagsModal(parent_elem);
    const active_tags_div = document.querySelector("#active_tags");
    this.tagsElem = ACTIVE_TAGS.genElementAndAttachAppend(
      active_tags_div,
      this
    );
  }
  path(){
    if(this.parent_card == null){
      return [" "]
    }
    return [...this.parent_card.parent.path(),this.parent_card.getText()]
  }
  focus(){
    this.elem.classList.remove("hide")
  }
  unFocus(){
    this.elem.classList.add("hide")
  }
  keyMap(e) {
    if (e.key == "Shift") {
      return
    }
    if (this.editTextModal.instance.isOpen) {
      if (e.key == "Enter") {
        console.log("enter on text");
        this.editTextModal.doSave();
        this.editTextModal.instance.close();
        return;
      }
    } else if (this.editTagsModal.instance.isOpen) {
      if (e.key == "Enter") {
        console.log("enter on tags");
        this.editTagsModal.doSave();
        this.editTagsModal.instance.close();
        return;
      }
    } else {
      if (e.key == "ArrowUp") {
        this.curFocus.focusPrevious();
        return;
      }
      if (e.key == "ArrowDown") {
        if (!e.shiftKey) {
          M.toast({ html: "<b>down: next</b>" });
          this.curFocus.focusNext();
        } else {
          M.toast({ html: "<b>shift+down: new</b>" });
          this.curFocus.genAfter(this, "And then...").edit();
        }
        return;
      }
      if (e.key == "ArrowRight") {
        if (!e.shiftKey) {
          M.toast({ html: "<b>right: into</b>" });
          if(this.curFocus.child != null){
            this.tree.focus(this.curFocus.child)
          }
        } else {
          M.toast({ html: "<b>shift+right: subtree</b>" });
          if(this.curFocus.child == null){
            this.tree.addChildCardSet(this.curFocus)
          }
        }
        return;
      }
      if (e.key == "ArrowLeft") {
          M.toast({ html: "<b>right: into</b>" });
          if(this.parent_card != null){
            this.tree.focus(this.parent_card.parent)
          }
        return;
      }      
      if (e.key == "Enter") {
        console.log("enter on nothing");
        M.toast({ html: "<b>enter: edit</b>" });
        this.curFocus.edit();
        return;
      }
      if (e.key == "n") {
        M.toast({ html: "<b>n: new</b>" });
        this.curFocus.genAfter(this, "And then...").edit();
        return;
      }      
      if (e.key == "t") {
        M.toast({ html: "<b>t: tags</b>" });
        this.curFocus.editTags();
        return;
      }
      M.toast({ html: "<b>" + e.key + "</b>" });
    }
  }
  updateTags(tags) {
    this.tags.innerHTML = tags
      .map((t) => {
        return '<div class="row">#' + t.trim() + "</div>";
      })
      .join("\n");
  }
  addCard(text) {
    const card = Card.genAppend(this, text, ["notmuch"]);
  }
}
class CardSetTree {
  constructor(elem) {
    this.elem = elem;
    this.root = new CardsSet(this, this.elem);
    this.elem.appendChild(this.root.elem);
    this.curFocus = null
    this.path = document.querySelector("#mycrumbs")
    this.focus(this.root)
    document.addEventListener("keyup", (e) => {
      this.focusKeyMap(e)
    });
  }
  setCrumbs(path){
    this.path.textContent = ""
    path.forEach((p)=>{
      const crumb = {}
      const c = CRUMB.genElementAndAttachAppend(this.path, crumb)
      console.log(c)
      c.innerHTML = p
    })
  }
  focusKeyMap(e){
    this.curFocus.keyMap(e);
  }
  focus(thing){
    if(this.curFocus != null){
      this.curFocus.unFocus()
    }
    this.curFocus = thing
    console.log(this.curFocus)
    this.setCrumbs(this.curFocus.path())
    this.curFocus.focus()
  }
  addChildCardSet(parent_card){
    const childset = new CardsSet(this, this.elem, parent_card)
    parent_card.child = childset
    childset.addCard("And then")
    this.elem.appendChild(childset.elem);
    this.focus(childset)
  }
}
const tree = new CardSetTree(document.querySelector("#cards"));
tree.root.addCard("Once upon a time...");


